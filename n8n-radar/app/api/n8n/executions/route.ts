import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { n8nClient } from "@/lib/n8n-client"

const querySchema = z.object({
  workflowId: z.string().optional(),
  status: z.enum(["success", "error", "running", "waiting", "canceled"]).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
})

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  )

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const { workflowId, status, limit } = parsed.data

  try {
    const [executions, waitingExecs] = await Promise.all([
      n8nClient.getExecutions({ workflowId, status, limit }),
      n8nClient.getWaitingExecutions(),
    ])

    // Waiting sempre no topo, sem duplicatas
    const waitingIds = new Set(waitingExecs.map((e) => e.id))
    const rest = executions.filter((e) => !waitingIds.has(e.id))
    const merged = [...waitingExecs, ...rest].slice(0, limit)

    return NextResponse.json({
      executions: merged,
      waitingCount: waitingExecs.length,
      total: merged.length,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "n8n unreachable", details: (err as Error).message },
      { status: 503 }
    )
  }
}
