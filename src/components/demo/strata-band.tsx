"use client"

import { network, type NetworkId } from "@/lib/demo"
import { cn } from "@/lib/utils"

export interface Layer {
  network: NetworkId
  share: number
  valueLabel: string
  shareLabel: string
  stale?: boolean
}

/**
 * The strata band: the whole portfolio as one band, one layer per network,
 * each sized by what you hold there. Stale layers are hatched, never zeroed.
 * With `onSelect`, the legend rows become toggle buttons that filter.
 */
export function StrataBand({
  layers,
  selected,
  onSelect,
  size = "lg",
  ariaLabel,
  staleLabel,
  className,
}: {
  layers: Layer[]
  selected?: NetworkId | null
  onSelect?: (id: NetworkId | null) => void
  size?: "lg" | "md"
  ariaLabel: string
  staleLabel?: string
  className?: string
}) {
  const visible = layers.filter((l) => l.share > 0)
  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn("flex w-full gap-[3px] overflow-hidden rounded-md", size === "lg" ? "h-12" : "h-8")}
        role="img"
        aria-label={ariaLabel}
      >
        {visible.map((l, i) => {
          const dim = selected && selected !== l.network
          return (
            <span
              key={l.network}
              className={cn(
                "animate-strata relative h-full min-w-[6px] transition-[opacity,flex-grow] duration-300",
                dim && "opacity-25",
                l.stale && "hatched"
              )}
              style={{
                flexGrow: l.share,
                flexBasis: 0,
                backgroundColor: network(l.network).color,
                animationDelay: `${i * 90}ms`,
              }}
            >
            </span>
          )
        })}
      </div>
      <ul className={cn("grid gap-1", size === "lg" ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
        {layers.map((l) => {
          const n = network(l.network)
          const active = selected === l.network
          const body = (
            <>
              <span
                className={cn("h-4 w-2.5 shrink-0 rounded-[3px]", l.stale && "hatched")}
                style={{ backgroundColor: n.color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 text-left leading-tight">
                <span className="block truncate text-[0.8rem] text-muted-foreground">
                  {n.name}
                  {l.stale && staleLabel && <span className="ml-1 text-loss">· {staleLabel}</span>}
                </span>
                <span className="num block font-semibold">{l.valueLabel}</span>
              </span>
              <span className="num shrink-0 text-right font-mono text-xs text-muted-foreground">{l.shareLabel}</span>
            </>
          )
          return (
            <li key={l.network}>
              {onSelect ? (
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(active ? null : l.network)}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-2.5 rounded-md border border-transparent px-2 py-1 text-sm transition-colors",
                    active ? "border-border bg-accent" : "hover:bg-muted",
                    selected && !active && "opacity-60"
                  )}
                >
                  {body}
                </button>
              ) : (
                <div className="flex min-h-9 items-center gap-2.5 px-1 text-sm">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
