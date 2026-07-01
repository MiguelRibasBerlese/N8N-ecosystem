import { CHART_COLORS } from "@/lib/chart-theme"
import type { WorkflowHealth } from "@/lib/types"

/**
 * Segmented bar from real per-workflow fields (errorRate24h, waitingCount, score) —
 * not a time-series sparkline, since past scores aren't persisted anywhere to trend against.
 */
export function HealthRatioBar({ health }: { health: WorkflowHealth }) {
  const errorPct = Math.round(health.errorRate24h * 100)
  const waitingPct = Math.min(health.waitingCount * 10, 40)
  const healthyPct = Math.max(0, 100 - errorPct - waitingPct)

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: "#1e1e28" }}>
      {healthyPct > 0 && <div style={{ width: `${healthyPct}%`, background: CHART_COLORS.healthy }} />}
      {waitingPct > 0 && <div style={{ width: `${waitingPct}%`, background: CHART_COLORS.warning }} />}
      {errorPct > 0 && <div style={{ width: `${errorPct}%`, background: CHART_COLORS.critical }} />}
    </div>
  )
}
