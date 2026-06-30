"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"

type Status = "online" | "offline" | "slow"

export function StatusIndicator() {
  const [status, setStatus] = useState<Status>("online")
  const [latency, setLatency] = useState<number | null>(null)

  useEffect(() => {
    async function check() {
      const start = Date.now()
      try {
        const res = await fetch("/api/n8n/health")
        const ms = Date.now() - start
        setLatency(ms)
        setStatus(!res.ok ? "offline" : ms > 3000 ? "slow" : "online")
      } catch {
        setStatus("offline")
        setLatency(null)
      }
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  const cfg = {
    online:  { color: "#22c55e", Icon: Wifi,    label: "Online" },
    slow:    { color: "#f59e0b", Icon: Wifi,    label: "Lento" },
    offline: { color: "#ef4444", Icon: WifiOff, label: "Offline" },
  }

  const { color, Icon, label } = cfg[status]

  return (
    <div className="flex items-center gap-1.5 text-[11px]" style={{ color }}>
      <Icon size={11} />
      <span>n8n {label}{latency && status !== "offline" ? ` · ${latency}ms` : ""}</span>
    </div>
  )
}
