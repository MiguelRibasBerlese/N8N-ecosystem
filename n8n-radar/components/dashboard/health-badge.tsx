import type { HealthLevel } from "@/lib/types"

const styles: Record<HealthLevel, { bg: string; color: string; ring: string }> = {
  healthy:  { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", ring: "rgba(34,197,94,0.3)" },
  warning:  { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", ring: "rgba(245,158,11,0.3)" },
  critical: { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", ring: "rgba(239,68,68,0.3)" },
}

const sizes = { sm: "36px", md: "48px", lg: "60px" }
const fonts = { sm: "11px", md: "14px", lg: "18px" }

export function HealthBadge({ score, level, size = "md" }: {
  score: number; level: HealthLevel; size?: "sm" | "md" | "lg"
}) {
  const s = styles[level]
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
      style={{
        width: sizes[size],
        height: sizes[size],
        fontSize: fonts[size],
        background: s.bg,
        color: s.color,
        boxShadow: `0 0 0 1px ${s.ring}`,
      }}
    >
      {score}
    </span>
  )
}
