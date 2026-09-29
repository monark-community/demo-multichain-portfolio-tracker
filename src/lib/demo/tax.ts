import { activityFor } from "./activity"
import { network, TOKENS } from "./catalog"
import { balancesOf } from "./holdings"
import { priceAt } from "./prices"
import type { ExportRequest, ExportResult, GainRow, TokenSymbol, TrackedWallet, Tx } from "./types"

export interface CsvLabels {
  gains: string[]
  transactions: string[]
  holdings: string[]
  types: Record<Tx["type"], string>
  statuses: Record<Tx["status"], string>
  fileNames: Record<ExportRequest["kind"], string>
}

interface Lot {
  qty: number
  unit: number
}

function csvCell(v: string | number): string {
  const s = String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n")
}

function moveUsd(t: Tx, now: number): number {
  const m = t.in ?? t.out
  return m ? m.amount * priceAt(m.symbol, t.timestamp, now) : 0
}

const iso = (t: number) => new Date(t).toISOString().replace(".000Z", "Z")
const fix = (n: number, d = 2) => n.toFixed(d)

/** Years that have at least one transaction, newest first. */
export function taxYears(wallets: TrackedWallet[], now: number): number[] {
  const years = new Set(activityFor(wallets, now).map((t) => new Date(t.timestamp).getUTCFullYear()))
  return [...years].sort((a, b) => b - a)
}

/**
 * Realized gains with ACB (average cost, pooled per asset) or FIFO lots.
 * Every wallet starts with an opening lot at its recorded average cost, then
 * acquisitions and disposals are replayed in time order. Bridges move funds
 * between your own networks and are not disposals.
 */
function realizedGains(req: ExportRequest, wallets: TrackedWallet[], now: number) {
  const selected = wallets.filter((w) => req.walletIds.includes(w.id))
  const txs = activityFor(selected, now)
    .filter((t) => t.status === "confirmed")
    .sort((a, b) => a.timestamp - b.timestamp)
  const labelOf = new Map(selected.map((w) => [w.id, w.label]))

  const pools = new Map<TokenSymbol, Lot[]>()
  for (const w of selected) {
    for (const b of balancesOf(w)) {
      const lots = pools.get(b.symbol) ?? []
      lots.push({ qty: b.amount * 2.5 + 50 / TOKENS[b.symbol].price, unit: b.unitCost * 0.94 })
      pools.set(b.symbol, lots)
    }
  }

  const take = (symbol: TokenSymbol, qty: number): number => {
    const lots = pools.get(symbol) ?? []
    if (req.method === "acb") {
      const q = lots.reduce((s, l) => s + l.qty, 0)
      const c = lots.reduce((s, l) => s + l.qty * l.unit, 0)
      const unit = q > 0 ? c / q : TOKENS[symbol].price
      const remaining = Math.max(0, q - qty)
      pools.set(symbol, remaining > 0 ? [{ qty: remaining, unit }] : [])
      return unit * qty
    }
    let left = qty
    let cost = 0
    while (left > 1e-12 && lots.length) {
      const lot = lots[0] as Lot
      const used = Math.min(lot.qty, left)
      cost += used * lot.unit
      lot.qty -= used
      left -= used
      if (lot.qty <= 1e-12) lots.shift()
    }
    if (left > 1e-12) cost += left * TOKENS[symbol].price * 0.9
    pools.set(symbol, lots)
    return cost
  }

  const add = (symbol: TokenSymbol, qty: number, unit: number) => {
    const lots = pools.get(symbol) ?? []
    lots.push({ qty, unit })
    pools.set(symbol, lots)
  }

  const rows: GainRow[] = []
  let gasUsd = 0
  const inYear = (t: number) => new Date(t).getUTCFullYear() === req.year
  for (const tx of txs) {
    if (inYear(tx.timestamp)) gasUsd += tx.gasUsd
    if (tx.type === "bridge" || tx.type === "approve" || tx.type === "mint" || tx.type === "nft-transfer") continue
    if (tx.out && (tx.type === "send" || tx.type === "swap")) {
      const price = priceAt(tx.out.symbol, tx.timestamp, now)
      const proceeds = tx.out.amount * price
      const cost = take(tx.out.symbol, tx.out.amount)
      if (inYear(tx.timestamp)) {
        rows.push({
          date: tx.timestamp,
          hash: tx.hash,
          network: tx.network,
          wallet: labelOf.get(tx.walletId) ?? tx.walletId,
          symbol: tx.out.symbol,
          amount: tx.out.amount,
          proceedsUsd: proceeds,
          costUsd: cost,
          gainUsd: proceeds - cost,
        })
      }
    }
    if (tx.in) add(tx.in.symbol, tx.in.amount, priceAt(tx.in.symbol, tx.timestamp, now))
  }
  const yearTxs = txs.filter((t) => inYear(t.timestamp))
  return { rows, gasUsd, yearTxs, selected, labelOf }
}

export function buildExport(req: ExportRequest, wallets: TrackedWallet[], now: number, labels: CsvLabels): ExportResult {
  const { rows, gasUsd, yearTxs, selected, labelOf } = realizedGains(req, wallets, now)
  const proceedsUsd = rows.reduce((s, r) => s + r.proceedsUsd, 0)
  const costUsd = rows.reduce((s, r) => s + r.costUsd, 0)

  let header: string[]
  let body: (string | number)[][]
  if (req.kind === "gains") {
    header = labels.gains
    body = rows.map((r) => [
      iso(r.date),
      network(r.network).name,
      r.wallet,
      r.symbol,
      r.amount,
      fix(r.proceedsUsd),
      fix(r.costUsd),
      fix(r.gainUsd),
      r.hash,
    ])
  } else if (req.kind === "transactions") {
    header = labels.transactions
    body = yearTxs
      .slice()
      .reverse()
      .map((t) => [
        iso(t.timestamp),
        network(t.network).name,
        labelOf.get(t.walletId) ?? "",
        labels.types[t.type],
        t.out?.symbol ?? "",
        t.out?.amount ?? "",
        t.in?.symbol ?? "",
        t.in?.amount ?? "",
        fix(moveUsd(t, now)),
        t.gasNative,
        t.gasSymbol,
        fix(t.gasUsd, 4),
        labels.statuses[t.status],
        t.hash,
      ])
  } else {
    header = labels.holdings
    const end = Math.min(now, Date.UTC(req.year, 11, 31, 23, 59, 59))
    body = selected.flatMap((w) =>
      balancesOf(w).map((b) => {
        const price = priceAt(b.symbol, end, now)
        return [
          iso(end),
          b.symbol,
          network(b.network).name,
          w.label,
          b.amount,
          fix(price, price < 10 ? 4 : 2),
          fix(b.amount * price),
          fix(b.amount * b.unitCost),
        ]
      })
    )
  }

  const csv = toCsv(header, body)
  return {
    request: req,
    txCount: yearTxs.length,
    disposals: rows.length,
    proceedsUsd,
    costUsd,
    gainUsd: proceedsUsd - costUsd,
    gasUsd,
    csv,
    fileName: `multitrack-${labels.fileNames[req.kind]}-${req.year}-${req.method}.csv`,
    previewHeader: header,
    preview: body.slice(0, 5).map((r) => r.map(String)),
    rowCount: body.length,
  }
}
