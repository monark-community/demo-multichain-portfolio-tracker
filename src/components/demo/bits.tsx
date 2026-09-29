"use client"

import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { network, type NetworkId, type TokenSymbol } from "@/lib/demo"
import { cn } from "@/lib/utils"

export function TokenGlyph({ symbol, className }: { symbol: TokenSymbol; className?: string }) {
  const short = symbol.slice(1, 4)
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-[0.62rem] font-medium tracking-tight",
        className
      )}
    >
      {short}
    </span>
  )
}

export function NetworkStack({ ids, className }: { ids: NetworkId[]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden="true">
      {ids.map((id) => (
        <span key={id} className="h-3 w-1.5 rounded-[2px]" style={{ backgroundColor: network(id).color }} />
      ))}
    </span>
  )
}

export function NetworkTag({ id, className }: { id: NetworkId; className?: string }) {
  const n = network(id)
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className="h-3 w-1.5 rounded-[2px]" style={{ backgroundColor: n.color }} aria-hidden="true" />
      {n.name}
    </span>
  )
}

/** Gains and losses always carry a sign and an arrow, never colour alone. */
export function Delta({ value, label, className }: { value: number; label: string; className?: string }) {
  const up = value >= 0
  const flat = Math.abs(value) < 0.00005
  const Icon = up ? ArrowUpRightIcon : ArrowDownRightIcon
  return (
    <span className={cn("num inline-flex items-center gap-0.5 font-semibold", flat ? "text-muted-foreground" : up ? "text-gain" : "text-loss", className)}>
      {!flat && <Icon className="size-3.5" aria-hidden="true" />}
      {label}
    </span>
  )
}

export function Panel({
  title,
  action,
  children,
  className,
  id,
}: {
  title?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section aria-labelledby={title && id ? id : undefined} className={cn("rounded-xl border bg-card", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          {title && (
            <h2 id={id} className="font-bold">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function PageTitle({ title, sub, action }: { title: string; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.6rem,3.5vw,2.25rem)] leading-tight font-extrabold tracking-[-0.03em]">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors",
        active ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <svg viewBox="0 0 64 40" className="mb-2 h-10 w-16 text-border" aria-hidden="true">
        <rect x="2" y="6" width="60" height="6" rx="2" fill="currentColor" />
        <rect x="2" y="17" width="44" height="6" rx="2" fill="currentColor" opacity="0.7" />
        <rect x="2" y="28" width="52" height="6" rx="2" fill="currentColor" opacity="0.45" />
      </svg>
      <p className="font-semibold">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
