"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Play, GitBranch, Bell, Radio, Shield, Wifi, WifiOff } from "lucide-react"
import { useSSE } from "@/hooks/use-sse"
import { useEffect, useState } from "react"

const NAV = [
  { href: "/",              label: "Overview",     icon: LayoutDashboard },
  { href: "/executions",   label: "Execuções",    icon: Play },
  { href: "/dependencies", label: "Dependências", icon: GitBranch },
  { href: "/alerts",       label: "Alertas",      icon: Bell },
]

function N8nStatus() {
  const [status, setStatus] = useState<"online"|"offline"|"slow">("online")
  const [ms, setMs] = useState<number|null>(null)

  useEffect(() => {
    async function check() {
      const t = Date.now()
      try {
        const r = await fetch("/api/n8n/health")
        const elapsed = Date.now() - t
        setMs(elapsed)
        setStatus(!r.ok ? "offline" : elapsed > 3000 ? "slow" : "online")
      } catch { setStatus("offline"); setMs(null) }
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  const cfg = {
    online:  { Icon: Wifi,    color: "#22c55e", label: "n8n Online" },
    slow:    { Icon: Wifi,    color: "#f59e0b", label: "n8n Lento" },
    offline: { Icon: WifiOff, color: "#ef4444", label: "n8n Offline" },
  }[status]

  return (
    <div style={{ color: cfg.color }} className="flex items-center gap-2 text-xs font-medium">
      <cfg.Icon size={11} />
      <span>{cfg.label}{ms && status !== "offline" ? ` · ${ms}ms` : ""}</span>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const path = usePathname()
  const { alerts, connected, summary } = useSSE()
  const activeAlerts = alerts.filter((a) => !a.resolvedAt).length

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0a0f" }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-64 shrink-0" style={{
        background: "#0d0d14",
        borderRight: "1px solid rgba(255,255,255,0.15)",
      }}>

        {/* Brand */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
              background: "linear-gradient(135deg, #8547e4, #b07af6)",
              boxShadow: "0 4px 16px rgba(133,71,228,0.35)",
            }}>
              <Shield size={17} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#f4f4f5", letterSpacing: "-0.01em" }}>
                FlowSentinel
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>Automation Monitor</p>
            </div>
          </div>
        </div>

        {/* Live strip */}
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl flex items-center justify-between" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}>
          <div className="flex items-center gap-2 text-xs font-medium" style={{
            color: connected ? "#22c55e" : "#52525b",
          }}>
            <Radio size={11} className={connected ? "pulse" : ""} />
            {connected ? "Ao vivo" : "Reconectando..."}
          </div>
          {summary && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{
              background: summary.critical > 0 ? "rgba(239,68,68,0.15)" :
                          summary.warning  > 0 ? "rgba(245,158,11,0.15)" :
                          "rgba(34,197,94,0.15)",
              color: summary.critical > 0 ? "#ef4444" :
                     summary.warning  > 0 ? "#f59e0b" : "#22c55e",
            }}>
              {summary.total} WF
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <p className="text-xs font-semibold px-3 mb-2" style={{
            color: "#3f3f46", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Monitoramento
          </p>

          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.07)" : "transparent",
                  color: active ? "#f4f4f5" : "#71717a",
                }}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: "#8547e4" }} />
                )}
                <Icon size={15} color={active ? "#b07af6" : "#52525b"} />
                {label}
                {label === "Alertas" && activeAlerts > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full text-xs font-bold text-white px-1.5"
                    style={{ background: "#ef4444" }}>
                    {activeAlerts}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 flex flex-col gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <N8nStatus />
          <p className="text-xs" style={{ color: "#3f3f46" }}>FlowSentinel · {summary?.total ?? 0} workflows</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" style={{ background: "#0a0a0f" }}>
        {children}
      </main>
    </div>
  )
}
