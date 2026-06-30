"use client"

import { useSearchParams } from "next/navigation"
import { useExecutions } from "@/hooks/use-executions"
import type { N8nExecution } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, XCircle, Clock, Loader2, Ban, ExternalLink } from "lucide-react"

const STATUS_CFG = {
  success:  { icon: CheckCircle2, color: "#4ade80", bg: "rgba(34,197,94,0.1)",  label: "Sucesso" },
  error:    { icon: XCircle,      color: "#f87171", bg: "rgba(239,68,68,0.1)",  label: "Erro" },
  running:  { icon: Loader2,      color: "#b07af6", bg: "rgba(133,71,228,0.1)", label: "Rodando" },
  waiting:  { icon: Clock,        color: "#fbbf24", bg: "rgba(245,158,11,0.1)", label: "Waiting" },
  canceled: { icon: Ban,          color: "#71717a", bg: "rgba(255,255,255,0.06)", label: "Cancelado" },
}

export default function ExecutionsPage() {
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
      <div className="flex items-center justify-between px-8 py-4 sticky top-0 z-10" style={{
        background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div>
          <h1 className="text-base font-semibold" style={{ color: "#f4f4f5" }}>Execuções</h1>
          {workflowId && (
            <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>Filtrado por workflow</p>
          )}
        </div>
        {waitingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          }}>
            <Clock size={13} color="#fbbf24" />
            <span className="text-sm font-medium" style={{ color: "#fde68a" }}>{waitingCount} em waiting</span>
          </div>
        )}
      </div>

      <div className="px-8 py-6 max-w-4xl space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          }}>
            <XCircle size={14} color="#f87171" />
            <p className="text-sm" style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        )}

        {stuck.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#fbbf24" }}>
              Presas &gt;60min ({stuck.length})
            </h2>
            <div className="space-y-2">
              {stuck.map((e) => <ExecRow key={e.id} exec={e} stuck />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#52525b" }}>
            Timeline — {executions.length} execuções
          </h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {rest.map((e) => <ExecRow key={e.id} exec={e} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
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
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{
      background: stuck ? "rgba(245,158,11,0.07)" : "#141420",
      border: stuck ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.07)",
    }}
      onMouseEnter={(e) => { if (!stuck) (e.currentTarget as HTMLElement).style.background = "#1a1a26" }}
      onMouseLeave={(e) => { if (!stuck) (e.currentTarget as HTMLElement).style.background = "#141420" }}
    >
      <span className="p-1.5 rounded-lg shrink-0" style={{ background: cfg.bg }}>
        <Icon size={13} color={cfg.color} className={exec.status === "running" ? "animate-spin" : ""} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "#e4e4e7" }}>
          {exec.workflowName ?? exec.workflowId}
        </p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: "#52525b" }}>{exec.id}</p>
      </div>

      <div className="text-right shrink-0 space-y-0.5">
        <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
        {stuck && elapsed !== null && (
          <p className="text-[11px]" style={{ color: "#fbbf24" }}>há {elapsed}min</p>
        )}
        {duration !== null && !stuck && (
          <p className="text-[11px]" style={{ color: "#71717a" }}>{duration}s</p>
        )}
        <p className="text-[10px]" style={{ color: "#52525b" }}>
          {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true, locale: ptBR })}
        </p>
      </div>

      {exec.status === "error" && n8nBase && (
        <a
          href={`${n8nBase}/workflow/${exec.workflowId}/executions/${exec.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[11px] rounded-lg px-2.5 py-1.5 transition-all shrink-0"
          style={{
            color: "#b07af6", border: "1px solid rgba(133,71,228,0.3)",
            background: "rgba(133,71,228,0.08)",
          }}
        >
          <ExternalLink size={11} />
          n8n
        </a>
      )}
    </div>
  )
}
