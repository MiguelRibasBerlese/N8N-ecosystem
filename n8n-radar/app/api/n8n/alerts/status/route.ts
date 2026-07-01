import { NextResponse } from "next/server"
import { setAlertStatus, alertStatusKey } from "@/lib/alert-store"
import type { AlertStatus } from "@/lib/types"

const VALID: AlertStatus[] = ["pendente", "em_ajuste", "resolvido"]

export async function PATCH(req: Request) {
  const { workflowId, type, status } = await req.json()

  if (!workflowId || !type || !VALID.includes(status)) {
    return NextResponse.json({ error: "workflowId, type e status válido são obrigatórios" }, { status: 400 })
  }

  await setAlertStatus(alertStatusKey({ workflowId, type }), status)
  return NextResponse.json({ ok: true })
}
