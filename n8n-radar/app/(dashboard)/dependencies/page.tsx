"use client"

import { useRouter } from "next/navigation"
import { getCriticalImpact } from "@/lib/dependency-mapper"
import { useWorkflows } from "@/hooks/use-workflows"
import { HealthBadge } from "@/components/dashboard/health-badge"
import { DependencyTreemap } from "@/components/charts/dependency-treemap"
import { ArrowRight, RefreshCw, GitBranch, AlertTriangle } from "lucide-react"

const ring  = (c: string) => `0 0 0 1px ${c}`
const ringD = (c: string) => `0 0 0 1px ${c}, 0 2px 8px rgba(0,0,0,0.55)`

const CENTRAL_NODES = [
  { id: "uaNVMiZ1Krm0Nx5V", name: "Clint",    desc: "Microserviço CRM principal" },
  { id: "BHtGzCTT2vy5FZcv", name: "DataBase", desc: "Microserviço de dados"      },
  { id: "iqGTMtrWFjjZsJbp", name: "Avisos",   desc: "Sistema de notificação"     },
]

const LEVEL: Record<string, { label: string; color: string; ringColor: string; bg: string }> = {
  critical: { label: "Crítico",  color: "#f87171", ringColor: "rgba(239,68,68,0.45)",   bg: "rgba(239,68,68,0.07)"  },
  warning:  { label: "Atenção",  color: "#fbbf24", ringColor: "rgba(245,158,11,0.45)",  bg: "rgba(245,158,11,0.05)" },
  healthy:  { label: "Saudável", color: "#4ade80", ringColor: "#3d3d48",                bg: "#0e0e16"               },
}

export default function DependenciesPage() {
  const router = useRouter()
  const { healths } = useWorkflows()
  const healthMap = Object.fromEntries(healths.map((h) => [h.workflowId, h]))

  return (
    <div className="min-h-full">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-7 py-4 sticky top-0 z-10"
        style={{
          background: "rgba(5,5,10,0.9)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 0 0 #2e2e38",
        }}>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#f0f0f2" }}>Mapa de Dependências</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "#4b4b58" }}>
            Grafo estático — extraído da instância em junho/2026
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#4b4b58" }}>
          <GitBranch size={11} /> {CENTRAL_NODES.length} nós centrais
        </div>
      </div>

      <div className="px-4 md:px-7 py-6 space-y-4" style={{ maxWidth: 1100 }}>

        <div className="rounded-2xl p-5" style={{ background: "#0e0e16", boxShadow: ringD("#3d3d48") }}>
          <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Impacto por Nó</p>
          <p className="text-xs mt-0.5 mb-3" style={{ color: "#4b4b58" }}>Tamanho = nº de dependentes diretos</p>
          <DependencyTreemap
            nodes={CENTRAL_NODES.map((node) => ({
              id: node.id,
              name: node.name,
              dependents: getCriticalImpact(node.id).directDependents.length,
              level: healthMap[node.id]?.level ?? "healthy",
            }))}
          />
        </div>

        {CENTRAL_NODES.map((node) => {
          const health = healthMap[node.id]
          const { directDependents } = getCriticalImpact(node.id)
          const lvl = LEVEL[health?.level ?? "healthy"]

          return (
            <div key={node.id} className="rounded-2xl overflow-hidden"
              style={{
                background: lvl.bg,
                boxShadow: ringD(lvl.ringColor),
              }}>

              {/* Node row */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 cursor-pointer"
                style={{
                  boxShadow: "0 1px 0 0 #2a2a34",
                  transition: "background 120ms",
                }}
                onClick={() => router.push(`/executions?workflowId=${node.id}`)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <div className="flex items-center gap-3.5">
                  {health && <HealthBadge score={health.score} level={health.level} size="md" />}
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#f0f0f2" }}>{node.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#4b4b58" }}>{node.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "#4b4b58" }}>{directDependents.length} dependentes</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: lvl.color }}>{lvl.label}</p>
                  </div>
                  {health?.level !== "healthy" && health && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{
                        color: lvl.color,
                        boxShadow: ring(lvl.ringColor),
                        background: lvl.bg,
                      }}>
                      <AlertTriangle size={10} /> Cascata
                    </div>
                  )}
                </div>
              </div>

              {/* Dependents grid */}
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#3a3a44" }}>
                  Workflows dependentes
                </p>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
                  {directDependents.map((d) => (
                    <button
                      key={d.sourceId}
                      onClick={() => router.push(`/executions?workflowId=${d.sourceId}`)}
                      className="flex items-center gap-2 text-left px-3 py-2.5 rounded-xl"
                      style={{
                        background: "#13131c",
                        boxShadow: ring("#3d3d48"),
                        transition: "background 120ms, box-shadow 120ms",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.background = "#1a1a26"
                        el.style.boxShadow = ring("#5a5a66")
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.background = "#13131c"
                        el.style.boxShadow = ring("#3d3d48")
                      }}
                    >
                      <ArrowRight size={10} color="#3a3a44" className="shrink-0" />
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
            background: "rgba(245,158,11,0.05)",
            boxShadow: ringD("rgba(245,158,11,0.4)"),
          }}>
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl shrink-0 mt-0.5"
              style={{ background: "rgba(245,158,11,0.12)" }}>
              <RefreshCw size={14} color="#f59e0b" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: "#f0f0f2" }}>[Sendflow] Member</p>
                  <p className="text-xs mt-0.5" style={{ color: "#f59e0b" }}>Loop recursivo detectado</p>
                </div>
                <button
                  onClick={() => router.push("/executions?workflowId=nKRnoyp65q8tN1B_xEdof&status=running")}
                  className="text-xs px-3 py-1.5 rounded-xl shrink-0"
                  style={{
                    color: "#fbbf24",
                    boxShadow: ring("rgba(245,158,11,0.35)"),
                    background: "rgba(245,158,11,0.08)",
                    transition: "box-shadow 120ms",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ring("rgba(245,158,11,0.65)") }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ring("rgba(245,158,11,0.35)") }}
                >
                  Monitorar execuções
                </button>
              </div>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: "#5a5a68" }}>
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
