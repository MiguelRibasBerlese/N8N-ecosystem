export const CHART_COLORS = {
  accent: "#22d3ee",
  accentSoft: "rgba(34,211,238,0.35)",
  healthy: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
  grid: "#1e1e28",
  axis: "#4b4b58",
  tooltipBg: "#13131c",
  tooltipRing: "#4b4b58",
} as const

export function colorByLevel(level: "healthy" | "warning" | "critical"): string {
  return { healthy: CHART_COLORS.healthy, warning: CHART_COLORS.warning, critical: CHART_COLORS.critical }[level]
}

export const tooltipStyle = {
  background: CHART_COLORS.tooltipBg,
  boxShadow: `0 0 0 1px ${CHART_COLORS.tooltipRing}, 0 8px 24px rgba(0,0,0,0.7)`,
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 12,
} as const
