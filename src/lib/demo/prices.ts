import { TOKENS } from "./catalog"
import { gaussian, rngFor } from "./random"
import type { TokenSymbol } from "./types"

const DAY = 86_400_000
const HOUR = 3_600_000
const DAYS = 400
const HOURS = 24 * 7

interface Series {
  /** log prices, index 0 = DAYS days ago, last = today */
  daily: number[]
  /** log prices, index 0 = 7 days ago, last = now */
  hourly: number[]
}

const cache = new Map<TokenSymbol, Series>()

/** Random walk pinned at both ends (a Brownian bridge), so "a year ago" and "now" are exact. */
function bridge(rand: () => number, steps: number, sigma: number, from: number, to: number): number[] {
  const walk = [0]
  for (let i = 1; i <= steps; i++) walk.push((walk[i - 1] as number) + gaussian(rand) * sigma)
  const end = walk[steps] as number
  return walk.map((w, i) => w - (i / steps) * end + from + ((to - from) * i) / steps)
}

function series(symbol: TokenSymbol): Series {
  const hit = cache.get(symbol)
  if (hit) return hit
  const t = TOKENS[symbol]
  const now = Math.log(t.price)
  const yearAgo = Math.log(t.price * t.yearAgo)
  const rand = rngFor(`price:${symbol}`)
  // Extend the walk past a year for older transactions, pinning 365 days ago.
  const older = bridge(rand, DAYS - 365, t.vol, yearAgo + gaussian(rand) * t.vol * 4, yearAgo)
  const year = bridge(rand, 365, t.vol, yearAgo, now)
  const daily = [...older.slice(0, -1), ...year]
  const weekAgo = daily[daily.length - 8] as number
  const hourly = bridge(rand, HOURS, t.vol / Math.sqrt(24), weekAgo, now)
  const s = { daily, hourly }
  cache.set(symbol, s)
  return s
}

function lerp(values: number[], position: number): number {
  const i = Math.max(0, Math.min(values.length - 1, position))
  const lo = Math.floor(i)
  const hi = Math.min(values.length - 1, lo + 1)
  const f = i - lo
  return (values[lo] as number) * (1 - f) + (values[hi] as number) * f
}

/** Historical price at `time`, with `now` as the anchor of the series. */
export function priceAt(symbol: TokenSymbol, time: number, now: number): number {
  const s = series(symbol)
  const age = now - time
  if (age <= 0) return Math.exp(s.hourly[s.hourly.length - 1] as number)
  if (age <= HOURS * HOUR) return Math.exp(lerp(s.hourly, HOURS - age / HOUR))
  return Math.exp(lerp(s.daily, s.daily.length - 1 - age / DAY))
}

/**
 * "Live" price: the reference price with a small deterministic wobble per
 * 20-second bucket, so the dashboard visibly refreshes without drifting away.
 */
export function livePrice(symbol: TokenSymbol, tick: number): number {
  const t = TOKENS[symbol]
  if (t.stable) return t.price + (rngFor(`live:${symbol}:${tick}`)() - 0.5) * 0.0008
  const g = gaussian(rngFor(`live:${symbol}:${tick}`))
  return t.price * Math.exp(g * t.vol * 0.06)
}

export function change24h(symbol: TokenSymbol, tick: number, now: number): number {
  const before = priceAt(symbol, now - DAY, now)
  return (livePrice(symbol, tick) - before) / before
}

export const TIME = { DAY, HOUR }
