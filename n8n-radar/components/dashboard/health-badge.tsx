import type { HealthLevel } from "@/lib/types"

const cfg: Record<HealthLevel, { bg: string; color: string; ring: string; glow: string }> = {
  healthy:  {
    bg:    "rgba(34,197,94,0.12)",
    color: "#4ade80",
    ring:  "0 0 0 1px rgba(34,197,94,0.45)",
    glow:  "0 0 14px rgba(34,197,94,0.25)",
  },
  warning:  {
    bg:    "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    ring:  "0 0 0 1px rgba(245,158,11,0.45)",
    glow:  "0 0 14px rgba(245,158,11,0.25)",
  },
  critical: {
    bg:    "rgba(239,68,68,0.12)",
    color: "#f87171",
    ring:  "0 0 0 1px rgba(239,68,68,0.45)",
    glow:  "0 0 14px rgba(239,68,68,0.25)",
  },
}

const sizes = { sm: "34px", md: "46px", lg: "58px" }
const fonts = { sm: "11px", md: "14px", lg: "18px" }

export function HealthBadge({ score, level, size = "md" }: {
  score: number
  level: HealthLevel
  size?: "sm" | "md" | "lg"
}) {
  const s = cfg[level]
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold shrink-0 tabular-nums"
      style={{
        width: sizes[size],
        height: sizes[size],
        fontSize: fonts[size],
        background: s.bg,
        color: s.color,
        boxShadow: `${s.ring}, ${s.glow}`,
      }}
    >
      {score}
    </span>
  )
}
