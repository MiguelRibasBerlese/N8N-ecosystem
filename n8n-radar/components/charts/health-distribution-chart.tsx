"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { CHART_COLORS } from "@/lib/chart-theme"
import type { HealthSummary } from "@/lib/types"

export function HealthDistributionChart({ summary }: { summary: HealthSummary }) {
  const data = [
    { name: "Saudáveis", value: summary.healthy, fill: CHART_COLORS.healthy },
    { name: "Atenção", value: summary.warning, fill: CHART_COLORS.warning },
    { name: "Críticos", value: summary.critical, fill: CHART_COLORS.critical },
  ].filter((d) => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
          paddingAngle={4} dataKey="value" strokeWidth={0}>
          {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="circle" iconSize={6}
          formatter={(v) => <span style={{ fontSize: 11, color: "#5a5a68" }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
