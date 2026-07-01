"use client"

import { useState } from "react"
import { Activity, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Server, TrendingDown, Search, type LucideIcon } from "lucide-react"
import { useSSE } from "@/hooks/use-sse"
import { useWorkflows } from "@/hooks/use-workflows"
import { WorkflowCard } from "@/components/dashboard/workflow-card"
import { AlertBanner } from "@/components/dashboard/alert-banner"
import { HealthDistributionChart } from "@/components/charts/health-distribution-chart"
import { WorstScoreChart } from "@/components/charts/worst-score-chart"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

/* ─── tiny helpers ─────────────────────────────────────────────── */
const ring  = (c: string) => `0 0 0 1px ${c}`
const ringD = (c: string) => `0 0 0 1px ${c}, 0 2px 8px rgba(0,0,0,0.55)`

function KpiCard({ Icon, label, value, sub, color, tint }: {
  Icon: LucideIcon; label: string; value: string | number; sub?: string; color: string; tint: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "#0e0e16",
        boxShadow: ringD("#3d3d48"),
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${tint} 0%, transparent 65%)`,
          borderRadius: 16,
        }} />
      <div className="relative flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: tint }}>
          <Icon size={15} color={color} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#3a3a44" }}>
          {label}
        </span>
      </div>
      <div className="relative">
        <p className="text-4xl font-bold tabular-nums leading-none"
          style={{ color, letterSpacing: "-0.03em" }}>
          {value}
        </p>
        {sub && <p className="text-xs mt-1.5 font-medium" style={{ color: "#4b4b58" }}>{sub}</p>}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center" style={{ height: 200 }}>
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: "#3d3d48", borderTopColor: "#22d3ee" }} />
    </div>
  )
}

export default function OverviewPage() {
  const { summary, alerts, connected, lastUpdate } = useSSE()
  const { healths, loading, refetch } = useWorkflows()
  const [search, setSearch] = useState("")

  const activeAlerts = alerts.filter((a) => !a.resolvedAt)

  const filtered = healths.filter((h) =>
    h.workflowName.toLowerCase().includes(search.toLowerCase())
  )
  const microservices = filtered.filter((h) => h.isDependencyNode)
  const rest = filtered.filter((h) => !h.isDependencyNode)
  const healthPct = summary ? Math.round((summary.healthy / summary.total) * 100) : 0

  return (
    <div className="min-h-full">

      {/* ── Hero / sticky header ── */}
      <div className="relative">
        <div className="grid-texture absolute inset-0 h-40 pointer-events-none" />
        <div className="relative flex flex-wrap items-center justify-between gap-2 px-4 md:px-7 py-4 sticky top-0 z-10"
          style={{
            background: "rgba(5,6,10,0.9)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 1px 0 0 #2e2e38",
          }}>
          <div>
            <h1 className="text-sm font-semibold" style={{ color: "#f0f0f2" }}>Overview</h1>
            <p className="text-[11px] mt-0.5" style={{ color: "#4b4b58" }}>
              {lastUpdate
                ? `Atualizado ${formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: ptBR })}`
                : "Aguardando conexão..."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: connected ? "rgba(34,197,94,0.08)" : "transparent",
                boxShadow: connected ? ring("rgba(34,197,94,0.35)") : ring("#3d3d48"),
                color: connected ? "#4ade80" : "#4b4b58",
              }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block"
                style={{
                  background: connected ? "#22c55e" : "#3d3d48",
                  boxShadow: connected ? "0 0 6px #22c55e" : "none",
                }} />
              {connected ? "Ao Vivo" : "Reconectando"}
            </div>
            <button onClick={refetch} title="Atualizar"
              className="w-8 h-8 flex items-center justify-center rounded-xl"
              style={{
                background: "#0e0e16",
                boxShadow: ring("#3d3d48"),
                transition: "box-shadow 120ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ring("#5a5a66") }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ring("#3d3d48") }}>
              <RefreshCw size={12} color="#5a5a68" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-7 py-6 space-y-7" style={{ maxWidth: 1320 }}>

        {/* ── Alertas ativos ── */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            {activeAlerts.map((a) => <AlertBanner key={a.id} alert={a} />)}
          </div>
        )}

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard Icon={Activity}      label="Total"     value={summary?.total ?? "—"}    sub="workflows monitorados"                       color="#67e8f9" tint="rgba(34,211,238,0.15)" />
          <KpiCard Icon={CheckCircle2}  label="Saudáveis" value={summary?.healthy ?? "—"}  sub={summary ? `${healthPct}% do total` : "—"}    color="#4ade80" tint="rgba(34,197,94,0.12)"  />
          <KpiCard Icon={AlertTriangle} label="Atenção"   value={summary?.warning ?? "—"}  sub="requerem revisão"                            color="#fbbf24" tint="rgba(245,158,11,0.12)" />
          <KpiCard Icon={XCircle}       label="Críticos"  value={summary?.critical ?? "—"} sub={`${activeAlerts.length} alerta(s) ativo(s)`} color={summary?.critical ? "#f87171" : "#4ade80"} tint={summary?.critical ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.08)"} />
        </div>

        {/* ── Gráficos ── */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-[2fr_3fr]">
          <div className="rounded-2xl p-5"
            style={{ background: "#0e0e16", boxShadow: ringD("#3d3d48") }}>
            <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Distribuição de Saúde</p>
            <p className="text-xs mt-0.5 mb-4" style={{ color: "#4b4b58" }}>Por criticidade</p>
            {summary ? <HealthDistributionChart summary={summary} /> : <Spinner />}
          </div>

          <div className="rounded-2xl p-5"
            style={{ background: "#0e0e16", boxShadow: ringD("#3d3d48") }}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Menor Score</p>
                <p className="text-xs mt-0.5" style={{ color: "#4b4b58" }}>Top 8 por risco</p>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "#4b4b58" }}>
                <TrendingDown size={11} /> 0–100
              </div>
            </div>
            {healths.length > 0 ? <WorstScoreChart healths={healths} /> : <Spinner />}
          </div>
        </div>

        {/* ── Microserviços ── */}
        {microservices.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Microserviços</p>
                <p className="text-xs mt-0.5" style={{ color: "#4b4b58" }}>Nós centrais — impacto em cascata</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "#4b4b58" }}>
                <Server size={11} /> {microservices.length} nós
              </span>
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
              {microservices.map((h) => <WorkflowCard key={h.workflowId} health={h} />)}
            </div>
          </div>
        )}

        {/* ── Todos os Workflows ── */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Todos os Workflows</p>
              <p className="text-xs mt-0.5" style={{ color: "#4b4b58" }}>{filtered.length} encontrados</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search size={13} color="#3a3a44"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm outline-none w-full sm:w-[180px]"
                style={{
                  background: "#0e0e16",
                  boxShadow: ring("#3d3d48"),
                  borderRadius: 12,
                  border: "none",
                  padding: "7px 12px 7px 32px",
                  color: "#f0f0f2",
                  transition: "box-shadow 120ms",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = ring("rgba(34,211,238,0.6)")
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = ring("#3d3d48")
                }}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 58 }} />
              ))}
            </div>
          ) : rest.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm" style={{ color: "#4b4b58" }}>Nenhum workflow encontrado</p>
            </div>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
              {rest.map((h) => <WorkflowCard key={h.workflowId} health={h} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
