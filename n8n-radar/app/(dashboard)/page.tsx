"use client"

import { useState } from "react"
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { Activity, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Server, TrendingDown, Search } from "lucide-react"
import { useSSE } from "@/hooks/use-sse"
import { useWorkflows } from "@/hooks/use-workflows"
import { WorkflowCard } from "@/components/dashboard/workflow-card"
import { AlertBanner } from "@/components/dashboard/alert-banner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

/* ─── tiny helpers ─────────────────────────────────────────────── */
const ring  = (c: string) => `0 0 0 1px ${c}`
const ringD = (c: string) => `0 0 0 1px ${c}, 0 2px 8px rgba(0,0,0,0.55)`

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "#13131c",
      boxShadow: ring("#4b4b58") + ", 0 8px 24px rgba(0,0,0,0.7)",
      borderRadius: 12,
      padding: "10px 14px",
      fontSize: 12,
    }}>
      {label && <p style={{ color: "#5a5a68", marginBottom: 6 }}>{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color ?? p.fill, display: "inline-block" }} />
          <span style={{ color: "#8a8a98" }}>{p.name}:</span>
          <span style={{ color: "#f0f0f2", fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function KpiCard({ Icon, label, value, sub, color, tint }: {
  Icon: any; label: string; value: string | number; sub?: string; color: string; tint: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "#0e0e16",
        boxShadow: ringD("#3d3d48"),
      }}>
      {/* gradient overlay */}
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
        style={{ borderColor: "#3d3d48", borderTopColor: "#8547e4" }} />
    </div>
  )
}

export default function OverviewPage() {
  const { summary, alerts, connected, lastUpdate } = useSSE()
  const { healths, loading, refetch } = useWorkflows()
  const [search, setSearch] = useState("")

  const activeAlerts = alerts.filter((a) => !a.resolvedAt)

  const pieData = summary ? [
    { name: "Saudáveis", value: summary.healthy,  fill: "#22c55e" },
    { name: "Atenção",   value: summary.warning,  fill: "#f59e0b" },
    { name: "Críticos",  value: summary.critical, fill: "#ef4444" },
  ].filter((d) => d.value > 0) : []

  const worst8 = [...healths].sort((a, b) => a.score - b.score).slice(0, 8)
  const barData = worst8.map((h) => ({
    name: h.workflowName.length > 14 ? h.workflowName.slice(0, 12) + "…" : h.workflowName,
    score: h.score,
    fill: h.level === "critical" ? "#ef4444" : h.level === "warning" ? "#f59e0b" : "#22c55e",
  }))

  const filtered = healths.filter((h) =>
    h.workflowName.toLowerCase().includes(search.toLowerCase())
  )
  const microservices = filtered.filter((h) => h.isDependencyNode)
  const rest = filtered.filter((h) => !h.isDependencyNode)
  const healthPct = summary ? Math.round((summary.healthy / summary.total) * 100) : 0

  return (
    <div className="min-h-full">

      {/* ── Sticky header ── */}
      <div className="flex items-center justify-between px-7 py-4 sticky top-0 z-10"
        style={{
          background: "rgba(5,5,10,0.9)",
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
          {/* live badge */}
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
          {/* refresh */}
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

      <div className="px-7 py-6 space-y-7" style={{ maxWidth: 1320 }}>

        {/* ── Alertas ativos ── */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            {activeAlerts.map((a) => <AlertBanner key={a.id} alert={a} />)}
          </div>
        )}

        {/* ── KPIs ── */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <KpiCard Icon={Activity}      label="Total"     value={summary?.total ?? "—"}    sub="workflows monitorados"                       color="#a78bfa" tint="rgba(133,71,228,0.15)" />
          <KpiCard Icon={CheckCircle2}  label="Saudáveis" value={summary?.healthy ?? "—"}  sub={summary ? `${healthPct}% do total` : "—"}    color="#4ade80" tint="rgba(34,197,94,0.12)"  />
          <KpiCard Icon={AlertTriangle} label="Atenção"   value={summary?.warning ?? "—"}  sub="requerem revisão"                            color="#fbbf24" tint="rgba(245,158,11,0.12)" />
          <KpiCard Icon={XCircle}       label="Críticos"  value={summary?.critical ?? "—"} sub={`${activeAlerts.length} alerta(s) ativo(s)`} color={summary?.critical ? "#f87171" : "#4ade80"} tint={summary?.critical ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.08)"} />
        </div>

        {/* ── Gráficos ── */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 3fr" }}>
          {/* Donut */}
          <div className="rounded-2xl p-5"
            style={{ background: "#0e0e16", boxShadow: ringD("#3d3d48") }}>
            <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Distribuição de Saúde</p>
            <p className="text-xs mt-0.5 mb-4" style={{ color: "#4b4b58" }}>Por criticidade</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                    paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={6}
                    formatter={(v) => <span style={{ fontSize: 11, color: "#5a5a68" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Spinner />}
          </div>

          {/* Bar */}
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
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#4b4b58" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#4b4b58" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(133,71,228,0.06)" }} />
                  <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <Spinner />}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Todos os Workflows</p>
              <p className="text-xs mt-0.5" style={{ color: "#4b4b58" }}>{filtered.length} encontrados</p>
            </div>
            <div className="relative">
              <Search size={13} color="#3a3a44"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm outline-none"
                style={{
                  width: 180,
                  background: "#0e0e16",
                  boxShadow: ring("#3d3d48"),
                  borderRadius: 12,
                  border: "none",
                  padding: "7px 12px 7px 32px",
                  color: "#f0f0f2",
                  transition: "box-shadow 120ms",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = ring("rgba(133,71,228,0.6)")
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
