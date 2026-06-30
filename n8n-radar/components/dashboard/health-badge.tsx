import type { HealthLevel } from "@/lib/types"

const styles: Record<HealthLevel, { bg: string; color: string; shadow: string }> = {
  healthy:  { bg: "rgba(34,197,94,0.1)",  color: "#22c55e", shadow: "0 0 0 1px rgba(34,197,94,0.25),  0 0 12px rgba(34,197,94,0.1)" },
  warning:  { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", shadow: "0 0 0 1px rgba(245,158,11,0.25), 0 0 12px rgba(245,158,11,0.1)" },
  critical: { bg: "rgba(239,68,68,0.1)",  color: "#ef4444", shadow: "0 0 0 1px rgba(239,68,68,0.25),  0 0 12px rgba(239,68,68,0.1)" },
}

const sizes = { sm: "34px", md: "46px", lg: "58px" }
const fonts = { sm: "11px", md: "14px", lg: "18px" }

export function HealthBadge({ score, level, size = "md" }: {
  score: number; level: HealthLevel; size?: "sm" | "md" | "lg"
}) {
  const s = styles[level]
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold shrink-0 tabular-nums"
      style={{
        width: sizes[size],
        height: sizes[size],
        fontSize: fonts[size],
        background: s.bg,
        color: s.color,
        boxShadow: s.shadow,
      }}
    >
      {score}
    </span>
  )
}
