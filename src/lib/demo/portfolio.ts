import { NETWORK_IDS, TOKENS } from "./catalog"
import { balancesOf } from "./holdings"
import { change24h, livePrice, priceAt, TIME } from "./prices"
import type { Balance, Horizon, NetworkId, NetworkSync, PortfolioFilter, Position, TokenSymbol, TrackedWallet } from "./types"

export const DUST_USD = 1

/** Balances whose network has been read at least once (a failed re-read keeps the last good data). */
export function readableBalances(wallets: TrackedWallet[], sync: Record<NetworkId, NetworkSync>): Balance[] {
  return wallets.flatMap(balancesOf).filter((b) => sync[b.network]?.syncedAt !== undefined)
}

export function filterBalances(
  balances: Balance[],
  filter: PortfolioFilter,
  horizons: Partial<Record<TokenSymbol, Horizon>>,
  tick: number,
  hideDust = false
): Balance[] {
  return balances.filter((b) => {
    if (filter.networks?.length && !filter.networks.includes(b.network)) return false
    if (filter.walletIds?.length && !filter.walletIds.includes(b.walletId)) return false
    if (filter.horizon && filter.horizon !== "all" && (horizons[b.symbol] ?? "none") !== filter.horizon) return false
    if (hideDust && b.amount * livePrice(b.symbol, tick) < DUST_USD) return false
    return true
  })
}

export function positions(
  balances: Balance[],
  horizons: Partial<Record<TokenSymbol, Horizon>>,
  tick: number,
  now: number
): Position[] {
  const groups = new Map<TokenSymbol, Balance[]>()
  for (const b of balances) groups.set(b.symbol, [...(groups.get(b.symbol) ?? []), b])
  const out: Position[] = []
  for (const [symbol, parts] of groups) {
    const price = livePrice(symbol, tick)
    const amount = parts.reduce((s, p) => s + p.amount, 0)
    const costUsd = parts.reduce((s, p) => s + p.amount * p.unitCost, 0)
    const valueUsd = amount * price
    const pnlUsd = valueUsd - costUsd
    out.push({
      symbol,
      amount,
      valueUsd,
      costUsd,
      pnlUsd,
      pnlPct: costUsd > 0 ? pnlUsd / costUsd : 0,
      change24hPct: change24h(symbol, tick, now),
      price,
      horizon: horizons[symbol] ?? "none",
      parts: [...parts].sort((a, b) => b.amount * price - a.amount * price),
      networks: NETWORK_IDS.filter((n) => parts.some((p) => p.network === n)),
    })
  }
  return out.sort((a, b) => b.valueUsd - a.valueUsd)
}

export interface Totals {
  valueUsd: number
  costUsd: number
  pnlUsd: number
  pnlPct: number
  change24hUsd: number
  change24hPct: number
}

export function totals(list: Position[]): Totals {
  const valueUsd = list.reduce((s, p) => s + p.valueUsd, 0)
  const costUsd = list.reduce((s, p) => s + p.costUsd, 0)
  const before = list.reduce((s, p) => s + p.valueUsd / (1 + p.change24hPct), 0)
  return {
    valueUsd,
    costUsd,
    pnlUsd: valueUsd - costUsd,
    pnlPct: costUsd > 0 ? (valueUsd - costUsd) / costUsd : 0,
    change24hUsd: valueUsd - before,
    change24hPct: before > 0 ? (valueUsd - before) / before : 0,
  }
}

export interface NetworkShare {
  network: NetworkId
  valueUsd: number
  share: number
}

export function byNetwork(balances: Balance[], tick: number): NetworkShare[] {
  const sums = new Map<NetworkId, number>()
  for (const b of balances) sums.set(b.network, (sums.get(b.network) ?? 0) + b.amount * livePrice(b.symbol, tick))
  const total = [...sums.values()].reduce((s, v) => s + v, 0)
  return NETWORK_IDS.filter((n) => sums.has(n)).map((network) => ({
    network,
    valueUsd: sums.get(network) ?? 0,
    share: total > 0 ? (sums.get(network) ?? 0) / total : 0,
  }))
}

export type Range = "7d" | "30d" | "90d" | "1y"
export const RANGES: Range[] = ["7d", "30d", "90d", "1y"]

const RANGE_SPEC: Record<Range, { span: number; step: number }> = {
  "7d": { span: 7 * TIME.DAY, step: 3 * TIME.HOUR },
  "30d": { span: 30 * TIME.DAY, step: 12 * TIME.HOUR },
  "90d": { span: 90 * TIME.DAY, step: TIME.DAY },
  "1y": { span: 365 * TIME.DAY, step: 3 * TIME.DAY },
}

export interface Point {
  t: number
  v: number
}

/** Value of the holdings you have today, priced along the chosen range. */
export function history(balances: Balance[], range: Range, now: number, tick: number): Point[] {
  const { span, step } = RANGE_SPEC[range]
  const amounts = new Map<TokenSymbol, number>()
  for (const b of balances) amounts.set(b.symbol, (amounts.get(b.symbol) ?? 0) + b.amount)
  const points: Point[] = []
  for (let t = now - span; t < now; t += step) {
    let v = 0
    for (const [s, a] of amounts) v += a * priceAt(s, t, now)
    points.push({ t, v })
  }
  let last = 0
  for (const [s, a] of amounts) last += a * livePrice(s, tick)
  points.push({ t: now, v: last })
  return points
}

export function tokenName(symbol: TokenSymbol): string {
  return TOKENS[symbol].name
}
