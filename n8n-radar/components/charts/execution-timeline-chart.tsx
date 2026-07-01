"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { CHART_COLORS } from "@/lib/chart-theme"
import type { N8nExecution } from "@/lib/types"

const BUCKET_MS = 30 * 60 * 1000 // 30min buckets
const BUCKET_COUNT = 24 // last ~12h

export function ExecutionTimelineChart({ executions }: { executions: N8nExecution[] }) {
  // eslint-disable-next-line react-hooks/purity -- display-only bucket boundaries, no correctness impact from re-render drift
  const now = Date.now()
  const buckets = Array.from({ length: BUCKET_COUNT }, (_, i) => {
    const bucketStart = now - (BUCKET_COUNT - i) * BUCKET_MS
    return { bucketStart, success: 0, error: 0, waiting: 0 }
  })

  for (const e of executions) {
    const t = new Date(e.startedAt).getTime()
    const idx = Math.floor((t - buckets[0].bucketStart) / BUCKET_MS)
    if (idx < 0 || idx >= BUCKET_COUNT) continue
    if (e.status === "success") buckets[idx].success++
    else if (e.status === "error") buckets[idx].error++
    else if (e.status === "waiting") buckets[idx].waiting++
  }

  const data = buckets.map((b) => ({
    name: new Date(b.bucketStart).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    Sucesso: b.success,
    Erro: b.error,
    Waiting: b.waiting,
  }))

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} interval={5} />
        <YAxis tick={{ fontSize: 10, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="Sucesso" stackId="1" stroke={CHART_COLORS.healthy} fill={CHART_COLORS.healthy} fillOpacity={0.25} />
        <Area type="monotone" dataKey="Erro" stackId="1" stroke={CHART_COLORS.critical} fill={CHART_COLORS.critical} fillOpacity={0.35} />
        <Area type="monotone" dataKey="Waiting" stackId="1" stroke={CHART_COLORS.warning} fill={CHART_COLORS.warning} fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
