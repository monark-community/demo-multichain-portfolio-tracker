"use client"

import { useEffect, useMemo, useState } from "react"

import { useDict } from "@/i18n/provider"
import { byNetwork, positions, readableBalances, totals, type NetworkId } from "@/lib/demo"
import { usePriceTick, useDemo } from "@/lib/demo/store"
import { ago } from "@/lib/format"

/** Wall-clock time that re-renders every `ms` (for "12 s ago" labels). */
export function useNow(ms = 5000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

export function useAgo() {
  const { d } = useDict()
  const now = useNow()
  return (then: number) => ago(d.time, d.common.justNow, then, now)
}

/** Everything derived from the demo state that most views need. */
export function usePortfolio(networkFilter?: NetworkId | null) {
  const demo = useDemo()
  const tick = usePriceTick()
  return useMemo(() => {
    const all = readableBalances(demo.wallets, demo.sync)
    const scoped = networkFilter ? all.filter((b) => b.network === networkFilter) : all
    const list = positions(scoped, demo.horizons, tick, demo.seededAt)
    return {
      demo,
      tick,
      now: demo.seededAt,
      balances: all,
      scoped,
      positions: list,
      totals: totals(list),
      shares: byNetwork(all, tick),
    }
  }, [demo, tick, networkFilter])
}
