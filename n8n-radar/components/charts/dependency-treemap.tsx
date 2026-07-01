"use client"

import { Treemap, Tooltip, ResponsiveContainer } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { CHART_COLORS, colorByLevel } from "@/lib/chart-theme"
import type { HealthLevel } from "@/lib/types"

interface TreemapNode {
  id: string
  name: string
  dependents: number
  level: HealthLevel
}

/** Box size = number of dependent workflows; color = health level. */
export function DependencyTreemap({ nodes }: { nodes: TreemapNode[] }) {
  const data = nodes.map((n) => ({
    name: n.name,
    size: Math.max(n.dependents, 1),
    fill: colorByLevel(n.level),
  }))

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        stroke="#05060a"
        fill={CHART_COLORS.accent}
        content={<TreemapCell />}
      >
        <Tooltip content={<ChartTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  )
}

interface TreemapCellProps {
  x?: number; y?: number; width?: number; height?: number; name?: string; fill?: string
}

function TreemapCell(props: TreemapCellProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, fill } = props
  if (width < 2 || height < 2) return null
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.75} stroke="#05060a" strokeWidth={2} rx={6} />
      {width > 60 && height > 30 && (
        <text x={x + 8} y={y + 18} fontSize={11} fill="#f0f0f2" fontWeight={600}>
          {name}
        </text>
      )}
    </g>
  )
}
