import { NextResponse } from "next/server"
import { n8nClient } from "@/lib/n8n-client"
import { calculateHealthScore, rankWorkflowsByRisk } from "@/lib/health-engine"
import { getCriticalImpact } from "@/lib/dependency-mapper"

export const revalidate = 30

export async function GET() {
  try {
    const [workflows, allExecutions] = await Promise.all([
      n8nClient.getWorkflows(),
      n8nClient.getExecutions({ limit: 100 }),
    ])

    const executionsByWorkflow = allExecutions.reduce<Record<string, typeof allExecutions>>(
      (acc, e) => {
        if (!acc[e.workflowId]) acc[e.workflowId] = []
        acc[e.workflowId].push(e)
        return acc
      },
      {}
    )

    const healths = workflows.map((wf) =>
      calculateHealthScore(wf, executionsByWorkflow[wf.id] ?? [])
    )

    const ranked = rankWorkflowsByRisk(healths)

    const enriched = ranked.map((h) => ({
      ...h,
      impact: getCriticalImpact(h.workflowId),
    }))

    return NextResponse.json({
      workflows,
      healths: enriched,
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { error: "n8n unreachable", details: (err as Error).message },
      { status: 503 }
    )
  }
}
