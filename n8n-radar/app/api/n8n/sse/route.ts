export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { n8nClient } from "@/lib/n8n-client"
import { calculateHealthScore, buildHealthSummary, rankWorkflowsByRisk } from "@/lib/health-engine"
import { runAllRules } from "@/lib/alert-rules"
import { saveAlert } from "@/lib/alert-store"

async function fetchHealthData() {
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

  return {
    summary: buildHealthSummary(healths),
    criticalWorkflows: rankWorkflowsByRisk(healths).filter((h) => h.level === "critical"),
    alerts,
    lastUpdated: new Date().toISOString(),
  }
}

export async function GET(req: Request) {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  const send = (event: string, data: unknown) => {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    writer.write(encoder.encode(payload)).catch(() => {})
  }

  const ping = () => {
    writer.write(encoder.encode(": keepalive\n\n")).catch(() => {})
  }

  // Envio inicial imediato
  fetchHealthData()
    .then((data) => send("health-update", data))
    .catch(() => send("health-update", { error: "n8n unreachable" }))

  // Polling 30s
  const healthInterval = setInterval(async () => {
    if (req.signal.aborted) return
    try {
      const data = await fetchHealthData()
      send("health-update", data)
      if (data.alerts.length > 0) {
        data.alerts.forEach((a) => send("alert", a))
      }
    } catch {
      send("health-update", { error: "n8n unreachable" })
    }
  }, 30_000)

  // Keepalive 15s
  const pingInterval = setInterval(ping, 15_000)

  req.signal.addEventListener("abort", () => {
    clearInterval(healthInterval)
    clearInterval(pingInterval)
    writer.close().catch(() => {})
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
