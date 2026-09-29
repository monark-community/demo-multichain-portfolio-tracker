"use client"

import { useEffect, useState } from "react"

export interface HeroLayer {
  network: string
  color: string
  name: string
  share: number
  value: string
}

export interface HeroPosition {
  symbol: string
  amount: string
  value: string
  colors: string[]
}

/** The hero visual: the real strata band settling while the total counts up. */
export function HeroCard({
  total,
  totalLabel,
  layers,
  positions,
  labels,
  format,
}: {
  total: number
  totalLabel: string
  layers: HeroLayer[]
  positions: HeroPosition[]
  labels: { total: string; synced: string; positions: string; aria: string }
  format: { locale: string }
}) {
  const [shown, setShown] = useState(totalLabel)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const fmt = new Intl.NumberFormat(format.locale, { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" })
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 1100)
      const eased = 1 - Math.pow(1 - k, 3)
      setShown(fmt.format(total * eased))
      if (k < 1) raf = requestAnimationFrame(step)
      else setShown(totalLabel)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [total, totalLabel, format.locale])

  return (
    <figure aria-label={labels.aria} className="relative rounded-2xl border bg-card p-5 shadow-[0_1px_0_rgb(24_33_29/0.04),0_24px_48px_-24px_rgb(24_33_29/0.25)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-mono text-muted-foreground">{labels.total}</p>
          <p className="num mt-1 text-[clamp(2rem,5vw,2.9rem)] leading-none font-extrabold tracking-[-0.035em]" aria-hidden="true">
            {shown}
          </p>
          <p className="sr-only">{totalLabel}</p>
        </div>
        <p className="mt-1 flex items-center gap-1.5 font-mono text-[0.68rem] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-gain" aria-hidden="true" />
          {labels.synced}
        </p>
      </div>
      <div className="mt-6 flex h-14 gap-[3px] overflow-hidden rounded-md" aria-hidden="true">
        {layers.map((l, i) => (
          <span
            key={l.network}
            className="animate-strata h-full"
            style={{ flexGrow: l.share, flexBasis: 0, backgroundColor: l.color, animationDelay: `${200 + i * 140}ms` }}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {layers.map((l) => (
          <li key={l.network} className="flex min-w-0 items-center gap-2 text-xs">
            <span className="h-3 w-1.5 shrink-0 rounded-[2px]" style={{ backgroundColor: l.color }} aria-hidden="true" />
            <span className="truncate text-muted-foreground">{l.name}</span>
            <span className="num ml-auto font-semibold">{l.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t pt-4">
        <p className="label-mono mb-2 text-muted-foreground">{labels.positions}</p>
        <ul className="divide-y">
          {positions.map((p) => (
            <li key={p.symbol} className="flex items-center gap-3 py-2">
              <span className="flex size-8 items-center justify-center rounded-full border font-mono text-[0.6rem]">{p.symbol.slice(1, 4)}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{p.symbol}</span>
                <span className="num block font-mono text-[0.7rem] text-muted-foreground">{p.amount}</span>
              </span>
              <span className="hidden h-2.5 w-24 gap-px overflow-hidden rounded-[2px] sm:flex" aria-hidden="true">
                {p.colors.map((c, i) => (
                  <span key={i} className="h-full flex-1" style={{ backgroundColor: c }} />
                ))}
              </span>
              <span className="num w-24 text-right text-sm font-semibold">{p.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
