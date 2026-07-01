import type { Alert, AlertStatus } from "./types"

const supabase =
  process.env.SUPABASE_URL
    ? (() => {
        const { createClient } = require("@supabase/supabase-js")
        return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
      })()
    : null

// Fallback em memória (perde dados ao reiniciar, mas funciona sem Supabase)
const inMemoryAlerts: Alert[] = []

export async function saveAlert(alert: Alert): Promise<void> {
  if (supabase) {
    await supabase.from("n8n_alerts").insert({
      workflow_id: alert.workflowId,
      workflow_name: alert.workflowName,
      alert_type: alert.type,
      severity: alert.severity,
      message: alert.message,
      detected_at: alert.detectedAt,
    })
  } else {
    inMemoryAlerts.unshift(alert)
    if (inMemoryAlerts.length > 200) inMemoryAlerts.pop()
  }
}

export async function getAlerts(limit = 50): Promise<Alert[]> {
  if (supabase) {
    const { data } = await supabase
      .from("n8n_alerts")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(limit)
    return (data ?? []).map(dbRowToAlert)
  }
  return inMemoryAlerts.slice(0, limit)
}

export async function getActiveAlerts(): Promise<Alert[]> {
  if (supabase) {
    const { data } = await supabase
      .from("n8n_alerts")
      .select("*")
      .is("resolved_at", null)
      .order("detected_at", { ascending: false })
    return (data ?? []).map(dbRowToAlert)
  }
  return inMemoryAlerts.filter((a) => !a.resolvedAt)
}

export async function resolveAlert(id: string): Promise<void> {
  if (supabase) {
    await supabase
      .from("n8n_alerts")
      .update({ resolved_at: new Date().toISOString(), auto_resolved: true })
      .eq("id", id)
  } else {
    const alert = inMemoryAlerts.find((a) => a.id === id)
    if (alert) alert.resolvedAt = new Date().toISOString()
  }
}

export function isUsingSupabase(): boolean {
  return supabase !== null
}

// Alertas são recalculados a cada poll (sem id estável), então o status
// manual (pendente/em_ajuste/resolvido) é guardado por workflowId+type.
export const alertStatusKey = (a: Pick<Alert, "workflowId" | "type">) => `${a.workflowId}:${a.type}`

const inMemoryStatus = new Map<string, AlertStatus>()

export async function getAlertStatuses(): Promise<Record<string, AlertStatus>> {
  if (supabase) {
    const { data } = await supabase.from("n8n_alert_status").select("key, status")
    return Object.fromEntries((data ?? []).map((r: { key: string; status: AlertStatus }) => [r.key, r.status]))
  }
  return Object.fromEntries(inMemoryStatus)
}

export async function setAlertStatus(key: string, status: AlertStatus): Promise<void> {
  if (supabase) {
    await supabase.from("n8n_alert_status").upsert({ key, status, updated_at: new Date().toISOString() })
  } else {
    inMemoryStatus.set(key, status)
  }
}

function dbRowToAlert(row: Record<string, unknown>): Alert {
  return {
    id: String(row.id),
    workflowId: String(row.workflow_id),
    workflowName: String(row.workflow_name),
    type: row.alert_type as Alert["type"],
    severity: row.severity as Alert["severity"],
    message: String(row.message),
    detectedAt: String(row.detected_at),
    resolvedAt: row.resolved_at ? String(row.resolved_at) : undefined,
    autoResolved: Boolean(row.auto_resolved),
    status: "pendente",
  }
}
