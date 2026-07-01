"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { CHART_COLORS } from "@/lib/chart-theme"
import type { WorkflowHealth } from "@/lib/types"

/** Multi-axis breakdown of a single workflow's health dimensions (0-100, higher = better). */
export function HealthRadarChart({ health }: { health: WorkflowHealth }) {
  const data = [
    { axis: "Erros", value: Math.max(0, 100 - Math.round(health.errorRate24h * 100)) },
    { axis: "Estabilidade", value: health.retryStormDetected ? 30 : 100 },
    { axis: "Fluidez", value: health.waitingCount > 0 ? Math.max(0, 100 - health.waitingCount * 20) : 100 },
    { axis: "Impacto", value: health.isDependencyNode ? 100 : 50 },
    { axis: "Score geral", value: health.score },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={CHART_COLORS.grid} />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: CHART_COLORS.axis }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Radar dataKey="value" name={health.workflowName} stroke={CHART_COLORS.accent} fill={CHART_COLORS.accent} fillOpacity={0.28} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
