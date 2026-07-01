import { NextResponse } from "next/server"
import { n8nClient } from "@/lib/n8n-client"
import { calculateHealthScore, buildHealthSummary, rankWorkflowsByRisk } from "@/lib/health-engine"
import { runAllRules } from "@/lib/alert-rules"
import { saveAlert, getAlertStatuses, alertStatusKey } from "@/lib/alert-store"

export async function GET() {
  try {
    const [workflows, executions] = await Promise.all([
      n8nClient.getWorkflows(),
      n8nClient.getExecutions({ limit: 200 }),
    ])

    const allExecutions = executions.reduce<Record<string, typeof executions>>(
      (acc, e) => {
        if (!acc[e.workflowId]) acc[e.workflowId] = []
        acc[e.workflowId].push(e)
        return acc
      },
      {}
    )

    const healths = workflows.map((wf) =>
      calculateHealthScore(wf, allExecutions[wf.id] ?? [])
    )

    const alerts = runAllRules({ healths, executions, allExecutions })
    await Promise.all(alerts.map(saveAlert))

    const statuses = await getAlertStatuses()
    for (const a of alerts) {
      const stored = statuses[alertStatusKey(a)]
      if (stored) a.status = stored
    }

    const criticalWorkflows = rankWorkflowsByRisk(healths).filter(
      (h) => h.level === "critical"
    )

    return NextResponse.json({
      summary: buildHealthSummary(healths),
      alerts,
      criticalWorkflows,
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { error: "n8n unreachable", details: (err as Error).message },
      { status: 503 }
    )
  }
}
