"use client"

import { useEffect, useState } from "react"
import type { Alert } from "@/lib/types"
import { AlertBanner } from "@/components/dashboard/alert-banner"
import { Bell, Database, CheckCircle2, ShieldCheck } from "lucide-react"

const ring  = (c: string) => `0 0 0 1px ${c}`
const ringD = (c: string) => `0 0 0 1px ${c}, 0 2px 8px rgba(0,0,0,0.55)`

function KpiPill({ label, value, color, tint, Icon }: {
  label: string; value: number; color: string; tint: string; Icon: any
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-5 py-4"
      style={{ background: "#0e0e16", boxShadow: ringD("#3d3d48") }}>
      <div className="p-2.5 rounded-xl" style={{ background: tint }}>
        <Icon size={14} color={color} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none tabular-nums"
          style={{ color, letterSpacing: "-0.02em" }}>
          {value}
        </p>
        <p className="text-xs mt-1.5 font-medium" style={{ color: "#4b4b58" }}>{label}</p>
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
          background: "rgba(5,5,10,0.9)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 0 0 #2e2e38",
        }}>
        <h1 className="text-sm font-semibold" style={{ color: "#f0f0f2" }}>Alertas</h1>
        <p className="text-[11px] mt-0.5" style={{ color: "#4b4b58" }}>
          Histórico de eventos detectados pelo FlowSentinel
        </p>
      </div>

      <div className="px-7 py-6 space-y-7" style={{ maxWidth: 800 }}>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <KpiPill label="Ativos"     value={active.length}   color="#f87171" tint="rgba(239,68,68,0.12)"  Icon={Bell}        />
          <KpiPill label="Resolvidos" value={resolved.length} color="#4ade80" tint="rgba(34,197,94,0.12)"  Icon={CheckCircle2} />
          <KpiPill label="Total"      value={alerts.length}   color="#a1a1aa" tint="rgba(255,255,255,0.05)" Icon={Database}    />
        </div>

        {/* Info persistência */}
        {!hasSupabase && (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs"
            style={{
              background: "#0e0e16",
              boxShadow: ring("#3d3d48"),
              color: "#4b4b58",
            }}>
            <Database size={13} color="#3a3a44" className="shrink-0" />
            <span>
              Alertas em memória — não persistem entre reinicializações.
              Configure <code style={{ color: "#a1a1aa", margin: "0 4px" }}>SUPABASE_URL</code> para persistência.
            </span>
          </div>
        )}

        {/* Lista */}
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
                boxShadow: "0 0 0 1px rgba(34,197,94,0.25), 0 0 20px rgba(34,197,94,0.08)",
              }}>
              <ShieldCheck size={26} color="#22c55e" />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#5a5a68" }}>Sem alertas registrados</p>
            <p className="text-xs mt-1.5" style={{ color: "#3a3a44" }}>Todos os sistemas operando normalmente</p>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#f87171" }}>
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
                  style={{ color: "#3a3a44" }}>
                  Resolvidos · {resolved.length}
                </p>
                <div className="space-y-2" style={{ opacity: 0.45 }}>
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
