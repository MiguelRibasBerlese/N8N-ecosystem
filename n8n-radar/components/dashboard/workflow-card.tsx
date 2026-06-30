"use client"

import { useRouter } from "next/navigation"
import type { WorkflowHealth } from "@/lib/types"
import { HealthBadge } from "./health-badge"
import { ChevronRight, Cpu } from "lucide-react"

export function WorkflowCard({ health }: { health: WorkflowHealth }) {
  const router = useRouter()

  const leftColor =
    health.level === "critical" ? "#ef4444" :
    health.level === "warning"  ? "#f59e0b" : "transparent"

  return (
    <button
      onClick={() => router.push(`/executions?workflowId=${health.workflowId}`)}
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group"
      style={{
        background: "#0d0d14",
        border: "1px solid #252235",
        borderLeft: `3px solid ${leftColor}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#141420"
        ;(e.currentTarget as HTMLElement).style.borderColor = `#3a3558`
        ;(e.currentTarget as HTMLElement).style.borderLeftColor = leftColor
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#0d0d14"
        ;(e.currentTarget as HTMLElement).style.borderColor = `#252235`
        ;(e.currentTarget as HTMLElement).style.borderLeftColor = leftColor
      }}
    >
      <HealthBadge score={health.score} level={health.level} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={{ color: "#e4e4e7" }}>
            {health.workflowName}
          </p>
          {health.isDependencyNode && (
            <Cpu size={11} color="#a78bfa" className="shrink-0" />
          )}
        </div>
        {health.issues[0] && (
          <p className="text-xs truncate mt-0.5" style={{ color: "#71717a" }}>{health.issues[0]}</p>
        )}
      </div>

      <div className="text-right shrink-0 space-y-0.5">
        {health.errorRate24h > 0 && (
          <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>
            {Math.round(health.errorRate24h * 100)}% err
          </p>
        )}
        {health.waitingCount > 0 && (
          <p className="text-xs font-medium" style={{ color: "#f59e0b" }}>
            {health.waitingCount} wait
          </p>
        )}
      </div>

      <ChevronRight size={13} color="#52525b" />
    </button>
  )
}
