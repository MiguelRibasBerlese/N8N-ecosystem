"use client"

import { useRouter } from "next/navigation"
import { getDependencies, getCriticalImpact } from "@/lib/dependency-mapper"
import { useWorkflows } from "@/hooks/use-workflows"
import { HealthBadge } from "@/components/dashboard/health-badge"
import { ArrowRight, RefreshCw, GitBranch } from "lucide-react"

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

export default function DependenciesPage() {
  const router = useRouter()
  const { healths } = useWorkflows()
  const healthMap = Object.fromEntries(healths.map((h) => [h.workflowId, h]))

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 sticky top-0 z-10" style={{
        background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div>
          <h1 className="text-base font-semibold" style={{ color: "#f4f4f5" }}>Mapa de Dependências</h1>
          <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>
            Grafo estático — extraído da instância em junho/2026
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#52525b" }}>
          <GitBranch size={12} /> {CENTRAL_NODES.length} nós centrais
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl space-y-4">
        {CENTRAL_NODES.map((node) => {
          const health = healthMap[node.id]
          const { directDependents } = getCriticalImpact(node.id)
          const lvl = health?.level ?? "healthy"

          return (
            <div key={node.id} className="rounded-2xl overflow-hidden" style={{
              background: "#0d0d14", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {/* Header do nó */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer transition-all"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                onClick={() => router.push(`/executions?workflowId=${node.id}`)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <div className="flex items-center gap-3">
                  {health && <HealthBadge score={health.score} level={health.level} size="md" />}
                  <div>
                    <p className="font-semibold" style={{ color: "#f4f4f5" }}>{node.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>{node.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#71717a" }}>{directDependents.length} dependentes</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: LEVEL_COLOR[lvl] }}>
                    {LEVEL_LABEL[lvl]}
                  </p>
                </div>
              </div>

              {/* Dependentes */}
              <div className="p-4">
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
                  {directDependents.map((d) => (
                    <button
                      key={d.sourceId}
                      onClick={() => router.push(`/executions?workflowId=${d.sourceId}`)}
                      className="flex items-center gap-2 text-left px-3 py-2 rounded-xl transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"
                        ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"
                        ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"
                      }}
                    >
                      <ArrowRight size={11} color="#52525b" className="shrink-0" />
                      <span className="text-xs truncate" style={{ color: "#a1a1aa" }}>{d.sourceName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {/* Loop recursivo */}
        <div className="rounded-2xl p-5" style={{
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)",
        }}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl shrink-0 mt-0.5" style={{ background: "rgba(245,158,11,0.15)" }}>
              <RefreshCw size={14} color="#fbbf24" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold" style={{ color: "#f4f4f5" }}>[Sendflow] Member</p>
                <button
                  onClick={() => router.push("/executions?workflowId=nKRnoyp65q8tN1B_xEdof&status=running")}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}
                >
                  Monitorar execuções
                </button>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#a1a1aa" }}>
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
