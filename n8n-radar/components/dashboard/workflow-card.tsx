"use client"

import { useRouter } from "next/navigation"
import type { WorkflowHealth } from "@/lib/types"
import { HealthBadge } from "./health-badge"
import { ChevronRight, Cpu } from "lucide-react"

const LEVEL_STRIPE: Record<string, string> = {
  critical: "#ef4444",
  warning:  "#f59e0b",
  healthy:  "transparent",
}

export function WorkflowCard({ health }: { health: WorkflowHealth }) {
  const router = useRouter()
  const stripe = LEVEL_STRIPE[health.level]
  const hasStripe = health.level !== "healthy"

  return (
    <button
      onClick={() => router.push(`/executions?workflowId=${health.workflowId}`)}
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
      style={{
        background: "#111114",
        border: "1px solid #27272a",
        borderLeft: hasStripe ? `3px solid ${stripe}` : "1px solid #27272a",
        boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
        transition: "background 150ms, border-color 150ms, box-shadow 150ms, transform 150ms",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "#18181c"
        el.style.borderColor = "#3f3f46"
        el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.6)"
        el.style.transform = "translateY(-1px)"
        if (hasStripe) el.style.borderLeftColor = stripe
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "#111114"
        el.style.borderColor = "#27272a"
        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.5)"
        el.style.transform = "translateY(0)"
        if (hasStripe) el.style.borderLeftColor = stripe
      }}
    >
      <HealthBadge score={health.score} level={health.level} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={{ color: "#e4e4e7" }}>
            {health.workflowName}
          </p>
          {health.isDependencyNode && (
            <Cpu size={10} color="#a678f0" className="shrink-0" />
          )}
        </div>
        {health.issues[0] && (
          <p className="text-xs truncate mt-0.5" style={{ color: "#52525b" }}>
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

      <ChevronRight size={13} color="#3f3f46" />
    </button>
  )
}
