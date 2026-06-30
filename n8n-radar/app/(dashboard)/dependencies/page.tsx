"use client"

import { useRouter } from "next/navigation"
import { getCriticalImpact } from "@/lib/dependency-mapper"
import { useWorkflows } from "@/hooks/use-workflows"
import { HealthBadge } from "@/components/dashboard/health-badge"
import { ArrowRight, RefreshCw, GitBranch, AlertTriangle } from "lucide-react"

const CENTRAL_NODES = [
  { id: "uaNVMiZ1Krm0Nx5V", name: "Clint",   desc: "Microserviço CRM principal" },
  { id: "BHtGzCTT2vy5FZcv", name: "DataBase", desc: "Microserviço de dados" },
  { id: "iqGTMtrWFjjZsJbp", name: "Avisos",   desc: "Sistema de notificação" },
]

const LEVEL_LABEL: Record<string, string> = {
  critical: "Crítico", warning: "Atenção", healthy: "Saudável",
}
const LEVEL_COLOR: Record<string, string> = {
  critical: "#ef4444", warning: "#f59e0b", healthy: "#22c55e",
}
const LEVEL_BG: Record<string, string> = {
  critical: "rgba(239,68,68,0.08)", warning: "rgba(245,158,11,0.06)", healthy: "rgba(34,197,94,0.04)",
}
const LEVEL_BORDER: Record<string, string> = {
  critical: "rgba(239,68,68,0.2)", warning: "rgba(245,158,11,0.2)", healthy: "#27272a",
}

export default function DependenciesPage() {
  const router = useRouter()
  const { healths } = useWorkflows()
  const healthMap = Object.fromEntries(healths.map((h) => [h.workflowId, h]))

  return (
    <div className="min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-7 py-4 sticky top-0 z-10"
        style={{
          background: "rgba(9,9,11,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1f1f23",
        }}>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#fafafa" }}>Mapa de Dependências</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "#52525b" }}>
            Grafo estático — extraído da instância em junho/2026
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "#52525b" }}>
          <GitBranch size={11} /> {CENTRAL_NODES.length} nós centrais
        </div>
      </div>

      <div className="px-7 py-6 space-y-4" style={{ maxWidth: 1100 }}>

        {CENTRAL_NODES.map((node) => {
          const health = healthMap[node.id]
          const { directDependents } = getCriticalImpact(node.id)
          const lvl = health?.level ?? "healthy"

          return (
            <div key={node.id} className="rounded-2xl overflow-hidden"
              style={{
                background: "#111114",
                border: `1px solid ${LEVEL_BORDER[lvl]}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}>

              {/* Node header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer transition-all"
                style={{ borderBottom: "1px solid #1f1f23" }}
                onClick={() => router.push(`/executions?workflowId=${node.id}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#18181c"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent"
                }}
              >
                <div className="flex items-center gap-3.5">
                  {health && <HealthBadge score={health.score} level={health.level} size="md" />}
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#fafafa" }}>{node.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>{node.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs" style={{ color: "#52525b" }}>{directDependents.length} dependentes</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: LEVEL_COLOR[lvl] }}>
                      {LEVEL_LABEL[lvl]}
                    </p>
                  </div>
                  {lvl !== "healthy" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{
                        background: LEVEL_BG[lvl],
                        border: `1px solid ${LEVEL_BORDER[lvl]}`,
                        color: LEVEL_COLOR[lvl],
                      }}>
                      <AlertTriangle size={10} />
                      Cascata
                    </div>
                  )}
                </div>
              </div>

              {/* Dependents */}
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#3f3f46" }}>
                  Workflows dependentes
                </p>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
                  {directDependents.map((d) => (
                    <button
                      key={d.sourceId}
                      onClick={() => router.push(`/executions?workflowId=${d.sourceId}`)}
                      className="flex items-center gap-2 text-left px-3 py-2.5 rounded-xl transition-all"
                      style={{
                        background: "#18181c",
                        border: "1px solid #27272a",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#222228"
                        ;(e.currentTarget as HTMLElement).style.borderColor = "#3f3f46"
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#18181c"
                        ;(e.currentTarget as HTMLElement).style.borderColor = "#27272a"
                      }}
                    >
                      <ArrowRight size={10} color="#3f3f46" className="shrink-0" />
                      <span className="text-xs truncate font-medium" style={{ color: "#a1a1aa" }}>
                        {d.sourceName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {/* Loop recursivo */}
        <div className="rounded-2xl p-5"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}>
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl shrink-0 mt-0.5"
              style={{ background: "rgba(245,158,11,0.12)" }}>
              <RefreshCw size={14} color="#f59e0b" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: "#fafafa" }}>[Sendflow] Member</p>
                  <p className="text-xs mt-0.5" style={{ color: "#f59e0b" }}>Loop recursivo detectado</p>
                </div>
                <button
                  onClick={() => router.push("/executions?workflowId=nKRnoyp65q8tN1B_xEdof&status=running")}
                  className="text-xs px-3 py-1.5 rounded-xl transition-all shrink-0"
                  style={{
                    color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.25)",
                    background: "rgba(245,158,11,0.08)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.5)" }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.25)" }}
                >
                  Monitorar execuções
                </button>
              </div>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: "#71717a" }}>
                Chama a si mesmo via HTTP — risco de loop infinito.
                Alerta disparado automaticamente quando &gt;3 execuções simultâneas.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
