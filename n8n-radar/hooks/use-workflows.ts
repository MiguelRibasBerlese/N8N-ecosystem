"use client"

import { useCallback, useEffect, useState } from "react"
import type { N8nWorkflow, WorkflowHealth } from "@/lib/types"

interface WorkflowsState {
  workflows: N8nWorkflow[]
  healths: WorkflowHealth[]
  loading: boolean
  error: string | null
}

export function useWorkflows() {
  const [state, setState] = useState<WorkflowsState>({
    workflows: [],
    healths: [],
    loading: true,
    error: null,
  })

  const interval = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL ?? 30_000)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/n8n/workflows")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setState({ workflows: data.workflows, healths: data.healths, loading: false, error: null })
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: (err as Error).message }))
    }
  }, [])

  useEffect(() => {
    fetch_()
    const id = setInterval(fetch_, interval)
    return () => clearInterval(id)
  }, [fetch_, interval])

  return { ...state, refetch: fetch_ }
}
