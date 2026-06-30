"use client"

import { useCallback, useEffect, useState } from "react"
import type { N8nExecution } from "@/lib/types"

interface ExecutionsState {
  executions: N8nExecution[]
  waitingCount: number
  loading: boolean
  error: string | null
}

export function useExecutions(workflowId?: string, status?: string) {
  const [state, setState] = useState<ExecutionsState>({
    executions: [],
    waitingCount: 0,
    loading: true,
    error: null,
  })

  const interval = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL ?? 30_000)

  const fetch_ = useCallback(async () => {
    const params = new URLSearchParams({ limit: "50" })
    if (workflowId) params.set("workflowId", workflowId)
    if (status) params.set("status", status)

    try {
      const res = await fetch(`/api/n8n/executions?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setState({ executions: data.executions, waitingCount: data.waitingCount, loading: false, error: null })
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: (err as Error).message }))
    }
  }, [workflowId, status])

  useEffect(() => {
    fetch_()
    const id = setInterval(fetch_, interval)
    return () => clearInterval(id)
  }, [fetch_, interval])

  return { ...state, refetch: fetch_ }
}
