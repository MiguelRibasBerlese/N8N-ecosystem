import type { Alert, AlertStatus } from "@/lib/types"
import { ShieldAlert, AlertTriangle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

const STATUS_LABEL: Record<AlertStatus, string> = {
  pendente: "Pendente",
  em_ajuste: "Em ajuste",
  resolvido: "Resolvido",
}

const cfg = {
  critical: {
    bg:        "rgba(239,68,68,0.08)",
    ring:      "0 0 0 1px rgba(239,68,68,0.4)",
    bar:       "#ef4444",
    iconBg:    "rgba(239,68,68,0.15)",
    iconColor: "#f87171",
    title:     "#fca5a5",
    message:   "#a1a1aa",
    time:      "rgba(248,113,113,0.8)",
    Icon: ShieldAlert,
  },
  warning: {
    bg:        "rgba(245,158,11,0.06)",
    ring:      "0 0 0 1px rgba(245,158,11,0.4)",
    bar:       "#f59e0b",
    iconBg:    "rgba(245,158,11,0.12)",
    iconColor: "#fbbf24",
    title:     "#fde68a",
    message:   "#a1a1aa",
    time:      "rgba(251,191,36,0.8)",
    Icon: AlertTriangle,
  },
}

export function AlertBanner({ alert, onStatusChange }: { alert: Alert; onStatusChange?: (status: AlertStatus) => void }) {
  const c = cfg[alert.severity]
  const Icon = c.Icon
  const elapsed = formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true, locale: ptBR })

  const changeStatus = async (status: AlertStatus) => {
    onStatusChange?.(status)
    await fetch("/api/n8n/alerts/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowId: alert.workflowId, type: alert.type, status }),
    })
  }

  return (
    <div
      className="relative flex items-start gap-4 rounded-2xl px-5 py-4 overflow-hidden"
      style={{
        background: c.bg,
        boxShadow: c.ring,
      }}
    >
      {/* Left accent bar (inset shadow — always visible) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-full"
        style={{ background: c.bar }}
      />

      <div className="p-2 rounded-xl shrink-0 mt-0.5" style={{ background: c.iconBg }}>
        <Icon size={14} color={c.iconColor} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: c.title }}>{alert.workflowName}</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: c.message }}>{alert.message}</p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0 mt-0.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap"
          style={{ color: c.time }}>
          <Clock size={10} />
          {elapsed}
        </div>
        <select
          value={alert.status}
          onChange={(e) => changeStatus(e.target.value as AlertStatus)}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium rounded-lg outline-none cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: c.title,
            border: "none",
            padding: "3px 6px",
          }}
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value} style={{ background: "#14141e", color: "#e8e8ec" }}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
