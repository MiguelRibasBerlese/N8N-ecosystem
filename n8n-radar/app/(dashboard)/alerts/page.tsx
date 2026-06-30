"use client"

import { useEffect, useState } from "react"
import type { Alert } from "@/lib/types"
import { AlertBanner } from "@/components/dashboard/alert-banner"
import { Bell, Database, CheckCircle2, ShieldCheck } from "lucide-react"

function KpiPill({ label, value, color, bgColor, Icon }: {
  label: string; value: number; color: string; bgColor: string; Icon: any
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-5 py-4"
      style={{
        background: "#111114",
        border: "1px solid #27272a",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}>
      <div className="p-2.5 rounded-xl" style={{ background: bgColor }}>
        <Icon size={14} color={color} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none tabular-nums" style={{ color, letterSpacing: "-0.02em" }}>
          {value}
        </p>
        <p className="text-xs mt-1.5 font-medium" style={{ color: "#52525b" }}>{label}</p>
      </div>
    </div>
  )
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  useEffect(() => {
    fetch("/api/n8n/health")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts ?? []))
      .finally(() => setLoading(false))
  }, [])

  const active = alerts.filter((a) => !a.resolvedAt)
  const resolved = alerts.filter((a) => a.resolvedAt)

  return (
    <div className="min-h-full">

      {/* Header */}
      <div className="sticky top-0 z-10 px-7 py-4"
        style={{
          background: "rgba(9,9,11,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1f1f23",
        }}>
        <h1 className="text-sm font-semibold" style={{ color: "#fafafa" }}>Alertas</h1>
        <p className="text-[11px] mt-0.5" style={{ color: "#52525b" }}>
          Histórico de eventos detectados pelo FlowSentinel
        </p>
      </div>

      <div className="px-7 py-6 space-y-7" style={{ maxWidth: 800 }}>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <KpiPill label="Ativos"     value={active.length}   color="#ef4444" bgColor="rgba(239,68,68,0.12)"  Icon={Bell} />
          <KpiPill label="Resolvidos" value={resolved.length} color="#22c55e" bgColor="rgba(34,197,94,0.12)"  Icon={CheckCircle2} />
          <KpiPill label="Total"      value={alerts.length}   color="#a1a1aa" bgColor="rgba(255,255,255,0.06)" Icon={Database} />
        </div>

        {/* Info bar */}
        {!hasSupabase && (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs"
            style={{
              background: "#111114",
              border: "1px solid #27272a",
              color: "#52525b",
            }}>
            <Database size={13} color="#3f3f46" className="shrink-0" />
            <span>
              Alertas em memória — não persistem entre reinicializações.
              Configure <code style={{ color: "#a1a1aa", margin: "0 4px" }}>SUPABASE_URL</code> para persistência.
            </span>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80 }} />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.15)",
                boxShadow: "0 0 20px rgba(34,197,94,0.08)",
              }}>
              <ShieldCheck size={26} color="#22c55e" />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#71717a" }}>Sem alertas registrados</p>
            <p className="text-xs mt-1.5" style={{ color: "#52525b" }}>Todos os sistemas operando normalmente</p>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#ef4444" }}>
                  Ativos · {active.length}
                </p>
                <div className="space-y-2">
                  {active.map((a) => <AlertBanner key={a.id} alert={a} />)}
                </div>
              </div>
            )}
            {resolved.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#3f3f46" }}>
                  Resolvidos · {resolved.length}
                </p>
                <div className="space-y-2" style={{ opacity: 0.4 }}>
                  {resolved.map((a) => <AlertBanner key={a.id} alert={a} />)}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
