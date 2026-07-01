"use client"

import { useRouter } from "next/navigation"
import type { WorkflowHealth } from "@/lib/types"
import { HealthBadge } from "./health-badge"
import { HealthRatioBar } from "@/components/charts/health-ratio-bar"
import { ChevronRight, Cpu } from "lucide-react"

/* stripe color by level */
const STRIPE: Record<string, string> = {
  critical: "#ef4444",
  warning:  "#f59e0b",
  healthy:  "transparent",
}

export function WorkflowCard({ health }: { health: WorkflowHealth }) {
  const router = useRouter()
  const stripe = STRIPE[health.level]
  const hasStripe = health.level !== "healthy"

  const shadowIdle = hasStripe
    ? `inset 3px 0 0 0 ${stripe}, 0 0 0 1px #3d3d48, 0 1px 4px rgba(0,0,0,0.5)`
    : `0 0 0 1px #3d3d48, 0 1px 4px rgba(0,0,0,0.5)`

  const shadowHover = hasStripe
    ? `inset 3px 0 0 0 ${stripe}, 0 0 0 1px #5a5a66, 0 6px 20px rgba(0,0,0,0.7)`
    : `0 0 0 1px #5a5a66, 0 6px 20px rgba(0,0,0,0.7)`

  return (
    <button
      onClick={() => router.push(`/executions?workflowId=${health.workflowId}`)}
      className="w-full text-left flex flex-col gap-2 px-4 py-3 rounded-2xl"
      style={{
        background: "#0e0e16",
        boxShadow: shadowIdle,
        transition: "background 120ms, box-shadow 120ms, transform 120ms",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "#14141e"
        el.style.boxShadow = shadowHover
        el.style.transform = "translateY(-1px)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "#0e0e16"
        el.style.boxShadow = shadowIdle
        el.style.transform = "translateY(0)"
      }}
    >
      <div className="flex items-center gap-3">
        <HealthBadge score={health.score} level={health.level} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate" style={{ color: "#e8e8ec" }}>
              {health.workflowName}
            </p>
            {health.isDependencyNode && (
              <Cpu size={10} color="#22d3ee" className="shrink-0" />
            )}
          </div>
          {health.issues[0] && (
            <p className="text-xs truncate mt-0.5" style={{ color: "#4b4b58" }}>
              {health.issues[0]}
            </p>
          )}
        </div>

        <div className="text-right shrink-0 space-y-0.5">
          {health.errorRate24h > 0 && (
            <p className="text-xs font-semibold" style={{ color: "#f87171" }}>
              {Math.round(health.errorRate24h * 100)}% err
            </p>
          )}
          {health.waitingCount > 0 && (
            <p className="text-xs font-medium" style={{ color: "#fbbf24" }}>
              {health.waitingCount} wait
            </p>
          )}
        </div>

        <ChevronRight size={13} color="#3a3a44" />
      </div>

      <HealthRatioBar health={health} />
    </button>
  )
}
