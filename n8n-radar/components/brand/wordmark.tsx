import { Logo } from "./logo"

export function Wordmark({ tagline }: { tagline?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={32} />
      <div>
        <p className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>PulseGrid</p>
        {tagline && (
          <p className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>{tagline}</p>
        )}
      </div>
    </div>
  )
}
