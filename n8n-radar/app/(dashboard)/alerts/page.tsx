"use client"

import { useEffect, useState } from "react"
import type { Alert } from "@/lib/types"
import { AlertBanner } from "@/components/dashboard/alert-banner"
import { Bell, Database, CheckCircle2, ShieldCheck } from "lucide-react"

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
      <div className="sticky top-0 z-10 px-8 py-4" style={{
        background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}>
        <h1 className="text-base font-semibold" style={{ color: "#f4f4f5" }}>Alertas</h1>
        <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>
          Histórico de eventos detectados pelo FlowSentinel
        </p>
      </div>

      <div className="px-8 py-6 max-w-3xl space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ativos",     value: active.length,   color: "#f87171", bg: "rgba(239,68,68,0.1)",  Icon: Bell },
            { label: "Resolvidos", value: resolved.length, color: "#4ade80", bg: "rgba(34,197,94,0.1)",  Icon: CheckCircle2 },
            { label: "Total",      value: alerts.length,   color: "#a1a1aa", bg: "rgba(255,255,255,0.06)", Icon: Database },
          ].map(({ label, value, color, bg, Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl px-5 py-4" style={{
              background: "#0d0d14", border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <div className="p-2.5 rounded-xl" style={{ background: bg }}>
                <Icon size={15} color={color} />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
                <p className="text-xs mt-1.5 font-medium" style={{ color: "#71717a" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {!hasSupabase && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs" style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#71717a",
          }}>
            <Database size={13} color="#52525b" className="shrink-0" />
            <span>
              Alertas em memória — não persistem entre reinicializações.
              Configure <code style={{ color: "#a1a1aa", margin: "0 4px" }}>SUPABASE_URL</code> para persistência.
            </span>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{
              background: "rgba(34,197,94,0.1)",
            }}>
              <ShieldCheck size={28} color="rgba(74,222,128,0.6)" />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#71717a" }}>Sem alertas registrados</p>
            <p className="text-xs mt-1.5" style={{ color: "#52525b" }}>Todos os sistemas operando normalmente</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {active.length > 0 && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#52525b" }}>
                  Ativos · {active.length}
                </p>
                {active.map((a) => <AlertBanner key={a.id} alert={a} />)}
              </>
            )}
            {resolved.length > 0 && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-widest pt-4" style={{ color: "#3f3f46" }}>
                  Resolvidos · {resolved.length}
                </p>
                <div style={{ opacity: 0.4 }} className="space-y-2">
                  {resolved.map((a) => <AlertBanner key={a.id} alert={a} />)}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
