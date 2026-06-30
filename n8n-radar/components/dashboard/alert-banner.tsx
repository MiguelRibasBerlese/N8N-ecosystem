import type { Alert } from "@/lib/types"
import { ShieldAlert, AlertTriangle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

const cfg = {
  critical: {
    wrap:      { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" },
    bar:       "#ef4444",
    iconWrap:  { background: "rgba(239,68,68,0.12)" },
    iconColor: "#f87171",
    title:     "#fca5a5",
    message:   "#a1a1aa",
    timeColor: "rgba(248,113,113,0.7)",
    Icon: ShieldAlert,
  },
  warning: {
    wrap:      { background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" },
    bar:       "#f59e0b",
    iconWrap:  { background: "rgba(245,158,11,0.12)" },
    iconColor: "#fbbf24",
    title:     "#fde68a",
    message:   "#a1a1aa",
    timeColor: "rgba(251,191,36,0.7)",
    Icon: AlertTriangle,
  },
}

export function AlertBanner({ alert }: { alert: Alert }) {
  const c = cfg[alert.severity]
  const Icon = c.Icon
  const elapsed = formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true, locale: ptBR })

  return (
    <div className="relative flex items-start gap-4 rounded-2xl px-5 py-4 overflow-hidden"
      style={c.wrap}>
      {/* Left bar accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full"
        style={{ background: c.bar }} />

      <div className="p-2 rounded-xl shrink-0 mt-0.5" style={c.iconWrap}>
        <Icon size={14} color={c.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: c.title }}>{alert.workflowName}</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: c.message }}>{alert.message}</p>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap mt-0.5"
        style={{ color: c.timeColor }}>
        <Clock size={10} />
        {elapsed}
      </div>
    </div>
  )
}
