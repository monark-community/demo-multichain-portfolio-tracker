import { NETWORK_IDS, TOKENS, profileFor, SAMPLE_EMPTY, type ProfileBalance, type WalletProfile } from "./catalog"
import { pick, rngFor } from "./random"
import type { Balance, Nft, NetworkId, TokenSymbol, TrackedWallet } from "./types"

const DAY = 86_400_000

/** What lives at an address: a hand-written profile, or a deterministic one derived from the address. */
export function profileOf(address: string): Pick<WalletProfile, "balances" | "nfts" | "activity"> {
  const known = profileFor(address)
  if (known) return known
  const a = address.toLowerCase()
  if (a === SAMPLE_EMPTY) return { balances: [], nfts: [], activity: 0 }
  const rand = rngFor(`profile:${a}`)
  if (rand() < 0.18) return { balances: [], nfts: [], activity: 0 }
  const networks = [...NETWORK_IDS].sort(() => rand() - 0.5).slice(0, 1 + Math.floor(rand() * 3))
  const balances: ProfileBalance[] = []
  for (const n of networks) {
    const native: TokenSymbol = n === "polygon-amoy" ? "tPOL" : "tETH"
    const nativeAmount = native === "tETH" ? 0.05 + rand() * 1.4 : 200 + rand() * 1800
    balances.push([n, native, round(nativeAmount, 4), TOKENS[native].price * (0.7 + rand() * 0.5)])
    const extras: TokenSymbol[] = ["tUSDC", "tDAI", "tLINK", "tUNI", n === "arb-sepolia" ? "tARB" : "tOP"]
    const count = 1 + Math.floor(rand() * 2)
    for (let i = 0; i < count; i++) {
      const s = pick(rand, extras)
      if (balances.some(([bn, bs]) => bn === n && bs === s)) continue
      const t = TOKENS[s]
      const usd = 80 + rand() * 1600
      balances.push([n, s, round(usd / t.price, t.stable ? 2 : 3), t.price * (t.stable ? 1 : 0.75 + rand() * 0.55)])
    }
  }
  return { balances, nfts: [], activity: 8 + Math.floor(rand() * 20) }
}

function round(n: number, digits: number): number {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

export function balancesOf(wallet: TrackedWallet): Balance[] {
  return profileOf(wallet.address).balances.map(([network, symbol, amount, unitCost]) => ({
    walletId: wallet.id,
    network,
    symbol,
    amount,
    unitCost,
  }))
}

export function nftsOf(wallet: TrackedWallet, now: number): Nft[] {
  return profileOf(wallet.address).nfts.map((n) => ({
    id: `${wallet.id}:${n.network}:${n.tokenId}`,
    walletId: wallet.id,
    network: n.network,
    collection: n.collection,
    name: n.name,
    tokenId: n.tokenId,
    estimateUsd: n.estimateUsd,
    acquiredAt: now - n.daysAgo * DAY,
    seed: n.tokenId * 7919 + n.collection.length * 131,
  }))
}

/** Networks on which an address holds anything (what a lookup "finds"). */
export function networksOf(address: string): NetworkId[] {
  const p = profileOf(address)
  const set = new Set<NetworkId>()
  for (const [n] of p.balances) set.add(n)
  for (const nft of p.nfts) set.add(nft.network)
  return NETWORK_IDS.filter((n) => set.has(n))
}
