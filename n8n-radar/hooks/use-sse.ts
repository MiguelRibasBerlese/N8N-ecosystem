"use client"

import { useEffect, useRef, useState } from "react"
import type { WorkflowHealth, Alert, HealthSummary } from "@/lib/types"

interface SSEState {
  summary: HealthSummary | null
  alerts: Alert[]
  criticalWorkflows: WorkflowHealth[]
  lastUpdate: string | null
  connected: boolean
}

export function useSSE() {
  const [state, setState] = useState<SSEState>({
    summary: null,
    alerts: [],
    criticalWorkflows: [],
    lastUpdate: null,
    connected: false,
  })
  const esRef = useRef<EventSource | null>(null)
  const backoffRef = useRef(5000)

  useEffect(() => {
    let cancelled = false

    function connect() {
      if (cancelled) return
      const es = new EventSource("/api/n8n/sse")
      esRef.current = es

      es.addEventListener("health-update", (e) => {
        backoffRef.current = 5000
        try {
          const data = JSON.parse(e.data)
          setState((prev) => ({
            ...prev,
            summary: data.summary ?? prev.summary,
            alerts: data.alerts ?? prev.alerts,
            criticalWorkflows: data.criticalWorkflows ?? prev.criticalWorkflows,
            lastUpdate: data.lastUpdated ?? new Date().toISOString(),
            connected: true,
          }))
        } catch {}
      })

      es.addEventListener("alert", (e) => {
        try {
          const alert: Alert = JSON.parse(e.data)
          setState((prev) => ({
            ...prev,
            alerts: [alert, ...prev.alerts.filter((a) => a.id !== alert.id)],
          }))
        } catch {}
      })

      es.onerror = () => {
        es.close()
        setState((prev) => ({ ...prev, connected: false }))
        if (!cancelled) {
          const delay = backoffRef.current
          backoffRef.current = Math.min(delay * 2, 30_000)
          setTimeout(connect, delay)
        }
      }
    }

    connect()
    return () => {
      cancelled = true
      esRef.current?.close()
    }
  }, [])

  return state
}
