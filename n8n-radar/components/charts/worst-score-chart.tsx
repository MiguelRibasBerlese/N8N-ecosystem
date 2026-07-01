"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { CHART_COLORS, colorByLevel } from "@/lib/chart-theme"
import type { WorkflowHealth } from "@/lib/types"

export function WorstScoreChart({ healths }: { healths: WorkflowHealth[] }) {
  const worst8 = [...healths].sort((a, b) => a.score - b.score).slice(0, 8)
  const data = worst8.map((h) => ({
    name: h.workflowName.length > 14 ? h.workflowName.slice(0, 12) + "…" : h.workflowName,
    score: h.score,
    fill: colorByLevel(h.level),
  }))

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(34,211,238,0.06)" }} />
        <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
