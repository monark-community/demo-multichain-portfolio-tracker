import { blockAt, CONTRACTS, NETWORK_IDS, NFT_COLLECTIONS, TOKENS } from "./catalog"
import { profileOf } from "./holdings"
import { priceAt } from "./prices"
import { hex, pick, rngFor } from "./random"
import type { NetworkId, TokenSymbol, TrackedWallet, Tx, TxType } from "./types"

const DAY = 86_400_000
const HISTORY_DAYS = 390

const WEIGHTS: [TxType, number][] = [
  ["receive", 0.23],
  ["send", 0.17],
  ["swap", 0.26],
  ["bridge", 0.1],
  ["approve", 0.12],
  ["mint", 0.07],
  ["nft-transfer", 0.05],
]

function weightedType(rand: () => number): TxType {
  let r = rand()
  for (const [type, w] of WEIGHTS) {
    if (r < w) return type
    r -= w
  }
  return "receive"
}

function gas(network: NetworkId, rand: () => number): { amount: number; symbol: TokenSymbol } {
  if (network === "polygon-amoy") return { amount: 0.004 + rand() * 0.028, symbol: "tPOL" }
  if (network === "eth-sepolia") return { amount: 0.0006 + rand() * 0.0034, symbol: "tETH" }
  return { amount: 0.000008 + rand() * 0.00009, symbol: "tETH" }
}

function amountFor(symbol: TokenSymbol, held: number, rand: () => number): number {
  const t = TOKENS[symbol]
  const base = held > 0 ? held * (0.04 + rand() * 0.32) : 120 / t.price
  const digits = t.stable ? 2 : t.price > 1000 ? 4 : 2
  const f = 10 ** digits
  return Math.max(1 / f, Math.round(base * f) / f)
}

const cache = new Map<string, Tx[]>()

/** Deterministic, believable history for a wallet, newest first. */
export function activityOf(wallet: TrackedWallet, now: number): Tx[] {
  const key = `${wallet.id}:${wallet.address}:${Math.floor(now / 60_000)}`
  const hit = cache.get(key)
  if (hit) return hit
  const profile = profileOf(wallet.address)
  const rand = rngFor(`activity:${wallet.address.toLowerCase()}`)
  const held = new Map<string, number>()
  for (const [n, s, a] of profile.balances) held.set(`${n}:${s}`, a)
  const networks = [...new Set(profile.balances.map(([n]) => n))]
  const txs: Tx[] = []
  if (networks.length === 0) return txs

  for (let i = 0; i < profile.activity; i++) {
    // Denser activity in recent months, like real wallets.
    const age = Math.pow(rand(), 1.6) * HISTORY_DAYS * DAY + rand() * DAY
    const timestamp = Math.round(now - age - 20 * 60_000)
    const network = pick(rand, networks)
    const tokensHere = profile.balances.filter(([n]) => n === network).map(([, s]) => s)
    const symbol = pick(rand, tokensHere)
    let type = weightedType(rand)
    if ((type === "mint" || type === "nft-transfer") && profile.nfts.length === 0 && rand() < 0.7) type = "receive"
    const g = gas(network, rand)
    const failed = type !== "receive" && rand() < 0.035
    const tx: Tx = {
      hash: `0x${hex(rand, 64)}`,
      walletId: wallet.id,
      network,
      type,
      timestamp,
      block: blockAt(network, timestamp),
      status: failed ? "failed" : "confirmed",
      gasNative: type === "receive" ? 0 : Math.round(g.amount * 1e7) / 1e7,
      gasSymbol: g.symbol,
      gasUsd: 0,
    }
    const heldAmount = held.get(`${network}:${symbol}`) ?? 0
    switch (type) {
      case "receive": {
        tx.in = { symbol, amount: amountFor(symbol, heldAmount, rand) }
        const fromFaucet = rand() < 0.2
        tx.counterparty = fromFaucet ? CONTRACTS.faucet.address : `0x${hex(rand, 40)}`
        if (fromFaucet) tx.counterpartyLabel = CONTRACTS.faucet.label
        break
      }
      case "send":
        tx.out = { symbol, amount: amountFor(symbol, heldAmount, rand) }
        tx.counterparty = `0x${hex(rand, 40)}`
        break
      case "swap": {
        const others = tokensHere.filter((s) => s !== symbol)
        const target: TokenSymbol = others.length ? pick(rand, others) : symbol === "tUSDC" ? "tETH" : "tUSDC"
        const outAmount = amountFor(symbol, heldAmount, rand)
        const usd = outAmount * priceAt(symbol, timestamp, now)
        const inAmount = (usd * 0.997) / priceAt(target, timestamp, now)
        const t = TOKENS[target]
        const f = 10 ** (t.stable ? 2 : t.price > 1000 ? 5 : 3)
        tx.out = { symbol, amount: outAmount }
        tx.in = { symbol: target, amount: Math.round(inAmount * f) / f }
        tx.counterparty = CONTRACTS.router.address
        tx.counterpartyLabel = CONTRACTS.router.label
        break
      }
      case "bridge": {
        const dest = pick(rand, NETWORK_IDS.filter((n) => n !== network && n !== "polygon-amoy"))
        tx.out = { symbol, amount: amountFor(symbol, heldAmount, rand) }
        tx.toNetwork = dest
        tx.counterparty = CONTRACTS.bridge.address
        tx.counterpartyLabel = CONTRACTS.bridge.label
        break
      }
      case "approve": {
        const c = rand() < 0.6 ? CONTRACTS.router : CONTRACTS.aave
        tx.counterparty = c.address
        tx.counterpartyLabel = c.label
        tx.nftName = symbol
        break
      }
      case "mint": {
        const own = profile.nfts.length ? pick(rand, profile.nfts) : undefined
        tx.nftName = own?.name ?? `${pick(rand, NFT_COLLECTIONS)} #${1 + Math.floor(rand() * 900)}`
        tx.counterparty = `0x${hex(rand, 40)}`
        tx.counterpartyLabel = own?.collection ?? tx.nftName.split(" #")[0]
        break
      }
      case "nft-transfer":
        tx.nftName = `${pick(rand, NFT_COLLECTIONS)} #${1 + Math.floor(rand() * 900)}`
        tx.counterparty = CONTRACTS.opensea.address
        tx.counterpartyLabel = CONTRACTS.opensea.label
        break
    }
    tx.gasUsd = tx.gasNative * priceAt(tx.gasSymbol, timestamp, now)
    txs.push(tx)
  }
  txs.sort((a, b) => b.timestamp - a.timestamp)
  cache.set(key, txs)
  return txs
}

export function activityFor(wallets: TrackedWallet[], now: number): Tx[] {
  return wallets.flatMap((w) => activityOf(w, now)).sort((a, b) => b.timestamp - a.timestamp)
}

/** USD value moved by a transaction (what the list shows on the right). */
export function txValueUsd(tx: Tx, now: number): number {
  const move = tx.in ?? tx.out
  if (!move) return 0
  return move.amount * priceAt(move.symbol, tx.timestamp, now)
}
