import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const bodySchema = z.object({
  message: z.string().min(1),
  severity: z.enum(["warning", "critical"]),
})

const AVISOS_WORKFLOW_ID = "iqGTMtrWFjjZsJbp"

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-dashboard-key")
  if (!key || key !== process.env.DASHBOARD_KEY) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/${AVISOS_WORKFLOW_ID}`

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    })

    return NextResponse.json({ ok: true, status: res.status })
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao chamar webhook Avisos", details: (err as Error).message },
      { status: 503 }
    )
  }
}
