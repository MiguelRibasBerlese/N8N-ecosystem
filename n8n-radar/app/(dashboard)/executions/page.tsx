"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useExecutions } from "@/hooks/use-executions"
import type { N8nExecution } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, XCircle, Clock, Loader2, Ban, ExternalLink, AlertTriangle } from "lucide-react"

const ring  = (c: string) => `0 0 0 1px ${c}`
const ringD = (c: string) => `0 0 0 1px ${c}, 0 1px 4px rgba(0,0,0,0.5)`

const STATUS_CFG = {
  success:  { Icon: CheckCircle2, color: "#4ade80", bg: "rgba(34,197,94,0.12)",   label: "Sucesso"   },
  error:    { Icon: XCircle,      color: "#f87171", bg: "rgba(239,68,68,0.12)",   label: "Erro"      },
  running:  { Icon: Loader2,      color: "#a78bfa", bg: "rgba(133,71,228,0.12)",  label: "Rodando"   },
  waiting:  { Icon: Clock,        color: "#fbbf24", bg: "rgba(245,158,11,0.12)",  label: "Waiting"   },
  canceled: { Icon: Ban,          color: "#5a5a68", bg: "rgba(255,255,255,0.05)", label: "Cancelado" },
}

function ExecRow({ exec, stuck = false }: { exec: N8nExecution; stuck?: boolean }) {
  const cfg = STATUS_CFG[exec.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.canceled
  const { Icon } = cfg
  const n8nBase = process.env.NEXT_PUBLIC_N8N_BASE_URL

  const duration = exec.stoppedAt
    ? Math.round((new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000)
    : null
  const elapsed = stuck
    ? Math.round((Date.now() - new Date(exec.startedAt).getTime()) / 60000)
    : null

  const shadowIdle = stuck
    ? `0 0 0 1px rgba(245,158,11,0.4), inset 3px 0 0 0 #f59e0b`
    : ringD("#3d3d48")

  const shadowHover = stuck
    ? `0 0 0 1px rgba(245,158,11,0.6), inset 3px 0 0 0 #f59e0b`
    : `0 0 0 1px #5a5a66, 0 4px 16px rgba(0,0,0,0.6)`

  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl"
      style={{
        background: stuck ? "rgba(245,158,11,0.05)" : "#0e0e16",
        boxShadow: shadowIdle,
        transition: "background 120ms, box-shadow 120ms",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = stuck ? "rgba(245,158,11,0.08)" : "#14141e"
        el.style.boxShadow = shadowHover
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = stuck ? "rgba(245,158,11,0.05)" : "#0e0e16"
        el.style.boxShadow = shadowIdle
      }}
    >
      <span className="p-2 rounded-xl shrink-0" style={{ background: cfg.bg }}>
        <Icon size={13} color={cfg.color} className={exec.status === "running" ? "animate-spin" : ""} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#e8e8ec" }}>
          {exec.workflowName ?? exec.workflowId}
        </p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: "#3a3a44" }}>{exec.id}</p>
      </div>

      <div className="text-right shrink-0 space-y-0.5">
        <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
        {stuck && elapsed !== null && (
          <p className="text-[11px]" style={{ color: "#fbbf24" }}>há {elapsed}min</p>
        )}
        {duration !== null && !stuck && (
          <p className="text-[11px]" style={{ color: "#4b4b58" }}>{duration}s</p>
        )}
        <p className="text-[10px]" style={{ color: "#3a3a44" }}>
          {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true, locale: ptBR })}
        </p>
      </div>

      {exec.status === "error" && n8nBase && (
        <a
          href={`${n8nBase}/workflow/${exec.workflowId}/executions/${exec.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(ev) => ev.stopPropagation()}
          className="flex items-center gap-1 text-[11px] rounded-xl px-2.5 py-1.5 shrink-0"
          style={{
            color: "#a78bfa",
            boxShadow: ring("rgba(133,71,228,0.35)"),
            background: "rgba(133,71,228,0.08)",
            transition: "box-shadow 120ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ring("rgba(133,71,228,0.65)") }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ring("rgba(133,71,228,0.35)") }}
        >
          <ExternalLink size={11} /> n8n
        </a>
      )}
    </div>
  )
}

function ExecutionsContent() {
  const params = useSearchParams()
  const workflowId = params.get("workflowId") ?? undefined
  const status     = params.get("status")     ?? undefined

  const { executions, waitingCount, loading, error } = useExecutions(workflowId, status)

  const stuck = executions.filter(
    (e) => e.status === "waiting" &&
      Date.now() - new Date(e.startedAt).getTime() > 60 * 60 * 1000
  )
  const rest = executions.filter((e) => !stuck.find((s) => s.id === e.id))

  return (
    <div className="min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-7 py-4 sticky top-0 z-10"
        style={{
          background: "rgba(5,5,10,0.9)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 0 0 #2e2e38",
        }}>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#f0f0f2" }}>Execuções</h1>
          {workflowId && (
            <p className="text-[11px] mt-0.5" style={{ color: "#4b4b58" }}>
              Filtrado por workflow · {executions.length} registros
            </p>
          )}
        </div>
        {waitingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(245,158,11,0.08)",
              boxShadow: ring("rgba(245,158,11,0.35)"),
            }}>
            <Clock size={12} color="#f59e0b" />
            <span className="text-xs font-semibold" style={{ color: "#fde68a" }}>
              {waitingCount} em waiting
            </span>
          </div>
        )}
      </div>

      <div className="px-7 py-6 space-y-7" style={{ maxWidth: 860 }}>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "rgba(239,68,68,0.06)", boxShadow: ring("rgba(239,68,68,0.35)") }}>
            <XCircle size={14} color="#f87171" />
            <p className="text-sm" style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        )}

        {stuck.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={12} color="#f59e0b" />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>
                Presas &gt;60min ({stuck.length})
              </p>
            </div>
            <div className="space-y-2">
              {stuck.map((e) => <ExecRow key={e.id} exec={e} stuck />)}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Timeline</p>
              <p className="text-xs mt-0.5" style={{ color: "#4b4b58" }}>{executions.length} execuções</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 62 }} />
              ))}
            </div>
          ) : rest.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm" style={{ color: "#4b4b58" }}>Nenhuma execução encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rest.map((e) => <ExecRow key={e.id} exec={e} />)}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="min-h-full">
      <div className="flex items-center justify-between px-7 py-4 sticky top-0 z-10"
        style={{ background: "rgba(5,5,10,0.9)", boxShadow: "0 1px 0 0 #2e2e38" }}>
        <h1 className="text-sm font-semibold" style={{ color: "#f0f0f2" }}>Execuções</h1>
      </div>
      <div className="px-7 py-6 space-y-2" style={{ maxWidth: 860 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 62 }} />
        ))}
      </div>
    </div>
  )
}

export default function ExecutionsPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ExecutionsContent />
    </Suspense>
  )
}
