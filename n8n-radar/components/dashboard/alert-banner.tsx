import type { Alert } from "@/lib/types"
import { ShieldAlert, AlertTriangle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

const cfg = {
  critical: {
    wrap:      { background: "rgba(239,68,68,0.07)",  border: "1px solid rgba(239,68,68,0.25)" },
    iconWrap:  { background: "rgba(239,68,68,0.15)" },
    iconColor: "#f87171",
    title:     "#fca5a5",
    timeColor: "rgba(248,113,113,0.6)",
    Icon: ShieldAlert,
  },
  warning: {
    wrap:      { background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)" },
    iconWrap:  { background: "rgba(245,158,11,0.15)" },
    iconColor: "#fbbf24",
    title:     "#fde68a",
    timeColor: "rgba(251,191,36,0.6)",
    Icon: AlertTriangle,
  },
}

export function AlertBanner({ alert }: { alert: Alert }) {
  const c = cfg[alert.severity]
  const Icon = c.Icon
  const elapsed = formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true, locale: ptBR })

  return (
    <div className="flex items-start gap-4 rounded-2xl px-5 py-4" style={c.wrap}>
      <div className="p-2.5 rounded-xl shrink-0 mt-0.5" style={c.iconWrap}>
        <Icon size={15} color={c.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: c.title }}>{alert.workflowName}</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: "#a1a1aa" }}>{alert.message}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium whitespace-nowrap mt-0.5"
        style={{ color: c.timeColor }}>
        <Clock size={11} />
        {elapsed}
      </div>
    </div>
  )
}
