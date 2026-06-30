"use client"

import { useState } from "react"
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { Activity, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Server, TrendingDown } from "lucide-react"
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
      background: "#141420", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12, padding: "10px 14px", fontSize: 12,
    }}>
      {label && <p style={{ color: "#71717a", marginBottom: 6 }}>{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color || p.fill, display: "inline-block" }} />
          <span style={{ color: "#a1a1aa" }}>{p.name}:</span>
          <span style={{ color: "#f4f4f5", fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color, bgColor }: {
  icon: any; label: string; value: string|number; sub?: string; color: string; bgColor: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4" style={{
      background: "#0d0d14", border: "1px solid rgba(255,255,255,0.15)",
    }}>
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: bgColor }}>
          <Icon size={16} color={color} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#52525b" }}>{label}</span>
      </div>
      <div>
        <p className="text-4xl font-bold leading-none" style={{ color, letterSpacing: "-0.02em" }}>{value}</p>
        {sub && <p className="text-xs mt-2 font-medium" style={{ color: "#71717a" }}>{sub}</p>}
      </div>
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
    name: h.workflowName.length > 16 ? h.workflowName.slice(0, 14) + "…" : h.workflowName,
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
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 sticky top-0 z-10" style={{
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}>
        <div>
          <h1 className="text-base font-semibold" style={{ color: "#f4f4f5" }}>Overview</h1>
          <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>
            {lastUpdate
              ? `Atualizado ${formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: ptBR })}`
              : "Aguardando conexão..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{
            background: connected ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${connected ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.15)"}`,
            color: connected ? "#22c55e" : "#52525b",
          }}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "pulse" : ""}`}
              style={{ background: connected ? "#22c55e" : "#52525b", display: "inline-block" }} />
            {connected ? "Ao Vivo" : "Reconectando"}
          </div>
          <button onClick={refetch} title="Atualizar"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <RefreshCw size={13} color="#71717a" />
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8" style={{ maxWidth: 1300 }}>

        {/* Alertas */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            {activeAlerts.map((a) => <AlertBanner key={a.id} alert={a} />)}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <KpiCard icon={Activity}      label="Total"      value={summary?.total ?? "—"}    sub="workflows monitorados"                         color="#b07af6" bgColor="rgba(133,71,228,0.12)" />
          <KpiCard icon={CheckCircle2}  label="Saudáveis"  value={summary?.healthy ?? "—"}  sub={summary ? `${healthPct}% do total` : "—"}      color="#22c55e" bgColor="rgba(34,197,94,0.12)"  />
          <KpiCard icon={AlertTriangle} label="Atenção"    value={summary?.warning ?? "—"}  sub="requerem revisão"                              color="#f59e0b" bgColor="rgba(245,158,11,0.12)" />
          <KpiCard icon={XCircle}       label="Críticos"   value={summary?.critical ?? "—"} sub={`${activeAlerts.length} alerta(s) ativo(s)`}   color={summary?.critical ? "#ef4444" : "#22c55e"} bgColor={summary?.critical ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.08)"} />
        </div>

        {/* Gráficos */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 3fr" }}>
          {/* Donut */}
          <div className="rounded-2xl p-6" style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.15)" }}>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "#a1a1aa" }}>Distribuição de Saúde</p>
            <p className="text-xs mb-5" style={{ color: "#52525b" }}>Proporção por nível de criticidade</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={56} outerRadius={82} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ fontSize: 11, color: "#71717a" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center" style={{ height: 200 }}>
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "#8547e4" }} />
              </div>
            )}
          </div>

          {/* Bar */}
          <div className="rounded-2xl p-6" style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Workflows com Menor Score</p>
                <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>Top 8 — ordenados por risco</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "#52525b" }}>
                <TrendingDown size={12} /> Score 0–100
              </div>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="score" name="Score" radius={[5,5,0,0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center" style={{ height: 190 }}>
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "#8547e4" }} />
              </div>
            )}
          </div>
        </div>

        {/* Microserviços */}
        {microservices.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Microserviços</p>
                <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>Nós centrais — impacto em cascata</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "#52525b" }}>
                <Server size={11} /> {microservices.length} nós críticos
              </span>
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))" }}>
              {microservices.map((h) => <WorkflowCard key={h.workflowId} health={h} />)}
            </div>
          </div>
        )}

        {/* Lista workflows */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Todos os Workflows</p>
              <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>{filtered.length} workflows</p>
            </div>
            <input
              type="search" placeholder="Buscar workflow..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="text-sm outline-none transition-all"
              style={{
                width: 200, background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12,
                padding: "8px 12px", color: "#f4f4f5",
              }}
            />
          </div>
          {loading ? (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 60 }} />
              ))}
            </div>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))" }}>
              {rest.map((h) => <WorkflowCard key={h.workflowId} health={h} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
