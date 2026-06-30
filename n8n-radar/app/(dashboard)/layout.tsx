"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Play, GitBranch, Bell,
  Radio, Shield, Wifi, WifiOff,
} from "lucide-react"
import { useSSE } from "@/hooks/use-sse"
import { useEffect, useState } from "react"

const NAV = [
  { href: "/",              label: "Overview",     Icon: LayoutDashboard },
  { href: "/executions",   label: "Execuções",    Icon: Play },
  { href: "/dependencies", label: "Dependências", Icon: GitBranch },
  { href: "/alerts",       label: "Alertas",      Icon: Bell },
]

/* ── ring helpers — always use box-shadow for visible borders ── */
const ring  = (color: string) => `0 0 0 1px ${color}`
const ringB = (color: string) => `0 0 0 1px ${color}, 0 2px 8px rgba(0,0,0,0.5)`

function N8nStatus() {
  const [status, setStatus] = useState<"online" | "offline" | "slow">("online")
  const [ms, setMs] = useState<number | null>(null)

  useEffect(() => {
    async function check() {
      const t = Date.now()
      try {
        const r = await fetch("/api/n8n/health")
        const elapsed = Date.now() - t
        setMs(elapsed)
        setStatus(!r.ok ? "offline" : elapsed > 3000 ? "slow" : "online")
      } catch {
        setStatus("offline")
        setMs(null)
      }
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  const cfg = {
    online:  { Icon: Wifi,    color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "n8n Online"  },
    slow:    { Icon: Wifi,    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "n8n Lento"   },
    offline: { Icon: WifiOff, color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "n8n Offline" },
  }[status]

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
      style={{
        background: cfg.bg,
        color: cfg.color,
        boxShadow: ring("rgba(255,255,255,0.06)"),
      }}>
      <cfg.Icon size={11} />
      <span>{cfg.label}{ms && status !== "offline" ? ` · ${ms}ms` : ""}</span>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const path = usePathname()
  const { alerts, connected, summary } = useSSE()
  const activeAlerts = alerts.filter((a) => !a.resolvedAt).length

  const healthColor = summary?.critical ? "#ef4444" : summary?.warning ? "#f59e0b" : "#22c55e"

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#05050a" }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-60 shrink-0 relative"
        style={{
          background: "#08080f",
          /* Right border via box-shadow — always rendered */
          boxShadow: "1px 0 0 0 #3d3d48",
        }}>

        {/* Purple accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #8547e4 50%, transparent 100%)",
          }} />

        {/* Brand */}
        <div className="px-4 pt-5 pb-4"
          style={{ boxShadow: "0 1px 0 0 #2e2e38" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                boxShadow: "0 0 0 1px #9f6ef5, 0 4px 20px rgba(124,58,237,0.5)",
              }}>
              <Shield size={15} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight" style={{ color: "#f0f0f2" }}>FlowSentinel</p>
              <p className="text-[10px] font-medium" style={{ color: "#4b4b58" }}>Automation Monitor</p>
            </div>
          </div>
        </div>

        {/* Live status strip */}
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl flex items-center justify-between"
          style={{
            background: "#0d0d16",
            boxShadow: ring("#3d3d48"),
          }}>
          <div className="flex items-center gap-2 text-xs font-medium"
            style={{ color: connected ? "#22c55e" : "#4b4b58" }}>
            <Radio size={10} className={connected ? "pulse" : ""} />
            {connected ? "Ao vivo" : "Reconectando..."}
          </div>
          {summary && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg tabular-nums"
              style={{
                background: `${healthColor}18`,
                color: healthColor,
                boxShadow: `0 0 0 1px ${healthColor}35`,
              }}>
              {summary.total} WF
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          <p className="text-[10px] font-bold px-2 mb-2 tracking-widest uppercase"
            style={{ color: "#3a3a44" }}>
            Monitoramento
          </p>

          {NAV.map(({ href, label, Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium"
                style={{
                  background: active ? "rgba(133,71,228,0.14)" : "transparent",
                  color: active ? "#c4a0f8" : "#5a5a68",
                  boxShadow: active ? "0 0 0 1px rgba(133,71,228,0.35)" : "none",
                  transition: "background 120ms, box-shadow 120ms, color 120ms",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "#13131c"
                    el.style.color = "#a1a1aa"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "transparent"
                    el.style.color = "#5a5a68"
                  }
                }}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{
                      background: "#8547e4",
                      boxShadow: "0 0 10px #8547e4",
                    }} />
                )}
                <Icon size={14} color={active ? "#a78bfa" : "currentColor"} />
                {label}
                {label === "Alertas" && activeAlerts > 0 && (
                  <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                    style={{ background: "#dc2626" }}>
                    {activeAlerts}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 flex flex-col gap-2"
          style={{ boxShadow: "0 -1px 0 0 #2e2e38", paddingTop: 12 }}>
          <N8nStatus />
          <p className="text-[10px] px-1" style={{ color: "#2e2e38" }}>
            FlowSentinel · {summary?.total ?? 0} workflows
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" style={{ background: "#05050a" }}>
        {children}
      </main>
    </div>
  )
}
