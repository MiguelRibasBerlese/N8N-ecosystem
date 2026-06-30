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

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "#18181c",
      border: "1px solid #27272a",
      borderRadius: 12,
      padding: "10px 14px",
      fontSize: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    }}>
      {label && <p style={{ color: "#71717a", marginBottom: 6 }}>{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color || p.fill, display: "inline-block" }} />
          <span style={{ color: "#a1a1aa" }}>{p.name}:</span>
          <span style={{ color: "#fafafa", fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color, bgColor }: {
  icon: any; label: string; value: string|number; sub?: string; color: string; bgColor: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "#111114",
        border: "1px solid #27272a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}>
      {/* Subtle gradient tint */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${bgColor} 0%, transparent 60%)`, borderRadius: 16 }} />

      <div className="relative flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: bgColor }}>
          <Icon size={15} color={color} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#3f3f46" }}>
          {label}
        </span>
      </div>
      <div className="relative">
        <p className="text-4xl font-bold tabular-nums leading-none"
          style={{ color, letterSpacing: "-0.03em" }}>
          {value}
        </p>
        {sub && <p className="text-xs mt-1.5 font-medium" style={{ color: "#52525b" }}>{sub}</p>}
      </div>
    </div>
  )
}

function SectionHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>{title}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>{sub}</p>}
      </div>
      {right}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center" style={{ height: 200 }}>
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: "#27272a", borderTopColor: "#8547e4" }} />
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

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-7 py-4 sticky top-0 z-10"
        style={{
          background: "rgba(9,9,11,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1f1f23",
        }}>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#fafafa" }}>Overview</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "#52525b" }}>
            {lastUpdate
              ? `Atualizado ${formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: ptBR })}`
              : "Aguardando conexão..."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: connected ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
              border: connected ? "1px solid rgba(34,197,94,0.2)" : "1px solid #27272a",
              color: connected ? "#22c55e" : "#52525b",
            }}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "pulse" : ""}`}
              style={{
                background: connected ? "#22c55e" : "#3f3f46",
                display: "inline-block",
                boxShadow: connected ? "0 0 6px #22c55e" : "none",
              }} />
            {connected ? "Ao Vivo" : "Reconectando"}
          </div>
          <button onClick={refetch} title="Atualizar"
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{
              background: "#111114",
              border: "1px solid #27272a",
              boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#3f3f46" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#27272a" }}>
            <RefreshCw size={12} color="#71717a" />
          </button>
        </div>
      </div>

      <div className="px-7 py-6 space-y-7" style={{ maxWidth: 1320 }}>

        {/* ── Alertas ── */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            {activeAlerts.map((a) => <AlertBanner key={a.id} alert={a} />)}
          </div>
        )}

        {/* ── KPIs ── */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <KpiCard icon={Activity}      label="Total"      value={summary?.total ?? "—"}    sub="workflows monitorados"                       color="#a678f0" bgColor="rgba(133,71,228,0.12)" />
          <KpiCard icon={CheckCircle2}  label="Saudáveis"  value={summary?.healthy ?? "—"}  sub={summary ? `${healthPct}% do total` : "—"}    color="#22c55e" bgColor="rgba(34,197,94,0.12)"  />
          <KpiCard icon={AlertTriangle} label="Atenção"    value={summary?.warning ?? "—"}  sub="requerem revisão"                            color="#f59e0b" bgColor="rgba(245,158,11,0.12)" />
          <KpiCard icon={XCircle}       label="Críticos"   value={summary?.critical ?? "—"} sub={`${activeAlerts.length} alerta(s) ativo(s)`} color={summary?.critical ? "#ef4444" : "#22c55e"} bgColor={summary?.critical ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.08)"} />
        </div>

        {/* ── Gráficos ── */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 3fr" }}>
          {/* Donut */}
          <div className="rounded-2xl p-5"
            style={{
              background: "#111114",
              border: "1px solid #27272a",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}>
            <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Distribuição de Saúde</p>
            <p className="text-xs mt-0.5 mb-4" style={{ color: "#52525b" }}>Proporção por criticidade</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                    paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={6}
                    formatter={(v) => <span style={{ fontSize: 11, color: "#71717a" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Spinner />}
          </div>

          {/* Bar */}
          <div className="rounded-2xl p-5"
            style={{
              background: "#111114",
              border: "1px solid #27272a",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Menor Score</p>
                <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>Top 8 por risco</p>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "#52525b" }}>
                <TrendingDown size={11} /> 0–100
              </div>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(133,71,228,0.05)" }} />
                  <Bar dataKey="score" name="Score" radius={[4,4,0,0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <Spinner />}
          </div>
        </div>

        {/* ── Microserviços ── */}
        {microservices.length > 0 && (
          <div>
            <SectionHeader
              title="Microserviços"
              sub="Nós centrais — impacto em cascata"
              right={
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "#52525b" }}>
                  <Server size={11} /> {microservices.length} nós
                </span>
              }
            />
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
              {microservices.map((h) => <WorkflowCard key={h.workflowId} health={h} />)}
            </div>
          </div>
        )}

        {/* ── Workflows ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Todos os Workflows</p>
              <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>{filtered.length} encontrados</p>
            </div>
            <div className="relative">
              <Search size={13} color="#3f3f46" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search" placeholder="Buscar..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="text-sm outline-none transition-all"
                style={{
                  width: 180,
                  background: "#111114",
                  border: "1px solid #27272a",
                  borderRadius: 12,
                  padding: "7px 12px 7px 32px",
                  color: "#fafafa",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,71,228,0.5)" }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#27272a" }}
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm" style={{ color: "#52525b" }}>Nenhum workflow encontrado</p>
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
