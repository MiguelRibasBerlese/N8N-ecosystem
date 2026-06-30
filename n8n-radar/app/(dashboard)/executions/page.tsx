"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useExecutions } from "@/hooks/use-executions"
import type { N8nExecution } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, XCircle, Clock, Loader2, Ban, ExternalLink, AlertTriangle } from "lucide-react"

const STATUS_CFG = {
  success:  { icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Sucesso" },
  error:    { icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Erro" },
  running:  { icon: Loader2,      color: "#a678f0", bg: "rgba(133,71,228,0.1)",  label: "Rodando" },
  waiting:  { icon: Clock,        color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Waiting" },
  canceled: { icon: Ban,          color: "#52525b", bg: "rgba(255,255,255,0.04)", label: "Cancelado" },
}

function ExecRow({ exec, stuck = false }: { exec: N8nExecution; stuck?: boolean }) {
  const cfg = STATUS_CFG[exec.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.canceled
  const Icon = cfg.icon
  const n8nBase = process.env.NEXT_PUBLIC_N8N_BASE_URL

  const duration = exec.stoppedAt
    ? Math.round((new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000)
    : null
  const elapsed = stuck
    ? Math.round((Date.now() - new Date(exec.startedAt).getTime()) / 60000)
    : null

  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all"
      style={{
        background: stuck ? "rgba(245,158,11,0.06)" : "#111114",
        border: stuck ? "1px solid rgba(245,158,11,0.25)" : "1px solid #27272a",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        if (!stuck) {
          (e.currentTarget as HTMLElement).style.background = "#18181c"
          ;(e.currentTarget as HTMLElement).style.borderColor = "#3f3f46"
        }
      }}
      onMouseLeave={(e) => {
        if (!stuck) {
          (e.currentTarget as HTMLElement).style.background = "#111114"
          ;(e.currentTarget as HTMLElement).style.borderColor = "#27272a"
        }
      }}
    >
      <span className="p-2 rounded-xl shrink-0" style={{ background: cfg.bg }}>
        <Icon size={13} color={cfg.color} className={exec.status === "running" ? "animate-spin" : ""} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#e4e4e7" }}>
          {exec.workflowName ?? exec.workflowId}
        </p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: "#3f3f46" }}>{exec.id}</p>
      </div>

      <div className="text-right shrink-0 space-y-0.5">
        <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
        {stuck && elapsed !== null && (
          <p className="text-[11px]" style={{ color: "#f59e0b" }}>há {elapsed}min</p>
        )}
        {duration !== null && !stuck && (
          <p className="text-[11px]" style={{ color: "#52525b" }}>{duration}s</p>
        )}
        <p className="text-[10px]" style={{ color: "#3f3f46" }}>
          {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true, locale: ptBR })}
        </p>
      </div>

      {exec.status === "error" && n8nBase && (
        <a
          href={`${n8nBase}/workflow/${exec.workflowId}/executions/${exec.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(ev) => ev.stopPropagation()}
          className="flex items-center gap-1 text-[11px] rounded-xl px-2.5 py-1.5 transition-all shrink-0"
          style={{
            color: "#a678f0",
            border: "1px solid rgba(133,71,228,0.25)",
            background: "rgba(133,71,228,0.08)",
            boxShadow: "0 0 0 0 transparent",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,71,228,0.5)" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,71,228,0.25)" }}
        >
          <ExternalLink size={11} />
          n8n
        </a>
      )}
    </div>
  )
}

function ExecutionsContent() {
  const params = useSearchParams()
  const workflowId = params.get("workflowId") ?? undefined
  const status = params.get("status") ?? undefined

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
          background: "rgba(9,9,11,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1f1f23",
        }}>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#fafafa" }}>Execuções</h1>
          {workflowId && (
            <p className="text-[11px] mt-0.5" style={{ color: "#52525b" }}>
              Filtrado por workflow · {executions.length} registros
            </p>
          )}
        </div>
        {waitingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
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
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}>
            <XCircle size={14} color="#ef4444" />
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
              <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>{executions.length} execuções</p>
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
              <p className="text-sm" style={{ color: "#52525b" }}>Nenhuma execução encontrada</p>
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

function SkeletonFallback() {
  return (
    <div className="min-h-full">
      <div className="flex items-center justify-between px-7 py-4 sticky top-0 z-10"
        style={{
          background: "rgba(9,9,11,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1f1f23",
        }}>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#fafafa" }}>Execuções</h1>
        </div>
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
    <Suspense fallback={<SkeletonFallback />}>
      <ExecutionsContent />
    </Suspense>
  )
}
