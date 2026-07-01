import { tooltipStyle } from "@/lib/chart-theme"

interface TooltipPayloadItem {
  name: string
  value: number | string
  color?: string
  fill?: string
}

export function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle}>
      {label && <p style={{ color: "#5a5a68", marginBottom: 6 }}>{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color ?? p.fill, display: "inline-block" }} />
          <span style={{ color: "#8a8a98" }}>{p.name}:</span>
          <span style={{ color: "#f0f0f2", fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}
