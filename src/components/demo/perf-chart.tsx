"use client"

import { useId, useMemo, useState } from "react"

import type { Point } from "@/lib/demo"
import { cn } from "@/lib/utils"

const W = 600
const H = 180

/** Hand-drawn SVG area chart: no chart library, a few hundred bytes of logic. */
export function PerfChart({
  points,
  formatValue,
  formatDate,
  ariaLabel,
  className,
}: {
  points: Point[]
  formatValue: (v: number) => string
  formatDate: (t: number) => string
  ariaLabel: string
  className?: string
}) {
  const id = useId()
  const [hover, setHover] = useState<number | null>(null)
  const geo = useMemo(() => {
    const vs = points.map((p) => p.v)
    const min = Math.min(...vs)
    const max = Math.max(...vs)
    const pad = (max - min) * 0.12 || max * 0.05 || 1
    const lo = min - pad
    const hi = max + pad
    const x = (i: number) => (i / Math.max(1, points.length - 1)) * W
    const y = (v: number) => H - ((v - lo) / (hi - lo)) * H
    const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join("")
    return { min, max, x, y, line, area: `${line}L${W},${H}L0,${H}Z` }
  }, [points])

  if (points.length < 2) return null
  const up = (points[points.length - 1]?.v ?? 0) >= (points[0]?.v ?? 0)
  const stroke = up ? "var(--gain)" : "var(--loss)"
  const hp = hover !== null ? points[hover] : undefined

  return (
    <figure className={cn("relative", className)}>
      <div className="relative h-44 sm:h-52">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          role="img"
          aria-label={ariaLabel}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            const i = Math.round(((e.clientX - r.left) / r.width) * (points.length - 1))
            setHover(Math.max(0, Math.min(points.length - 1, i)))
          }}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <pattern id={`${id}-grid`} width="60" height="45" patternUnits="userSpaceOnUse">
              <path d="M0 45H60" stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill={`url(#${id}-grid)`} />
          <path d={geo.area} fill={stroke} opacity="0.1" />
          <path d={geo.line} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          {hover !== null && hp && (
            <line x1={geo.x(hover)} x2={geo.x(hover)} y1="0" y2={H} stroke="var(--foreground)" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {hover !== null && hp && (
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs shadow-sm"
            style={{ left: `${Math.min(88, Math.max(12, (hover / (points.length - 1)) * 100))}%` }}
          >
            <p className="num font-semibold">{formatValue(hp.v)}</p>
            <p className="text-muted-foreground">{formatDate(hp.t)}</p>
          </div>
        )}
        <span className="num absolute top-0 right-0 font-mono text-[0.68rem] text-muted-foreground">{formatValue(geo.max)}</span>
        <span className="num absolute right-0 bottom-0 font-mono text-[0.68rem] text-muted-foreground">{formatValue(geo.min)}</span>
      </div>
      <figcaption className="mt-2 flex justify-between font-mono text-[0.7rem] text-muted-foreground">
        <span>{formatDate(points[0]?.t ?? 0)}</span>
        <span>{formatDate(points[points.length - 1]?.t ?? 0)}</span>
      </figcaption>
    </figure>
  )
}
