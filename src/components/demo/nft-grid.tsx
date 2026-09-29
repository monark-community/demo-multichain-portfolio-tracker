"use client"

import { useMemo } from "react"

import { NftCard } from "@/components/ui/nft-card"
import { t } from "@/i18n/t"
import { useDict } from "@/i18n/provider"
import { network, nftsOf } from "@/lib/demo"
import { mulberry32 } from "@/lib/demo/random"
import { date, usd } from "@/lib/format"

import { EmptyState } from "./bits"
import { usePortfolio } from "./hooks"

const PALETTES = [
  ["#1f2a24", "#c8961e", "#e9e2cc", "#4e7a3a", "#b0573a"],
  ["#18211d", "#3b6d70", "#d8d4c7", "#7a5a7c", "#c8961e"],
  ["#2a2320", "#b0573a", "#efe6d3", "#6f8f5a", "#3b6d70"],
  ["#16202a", "#6fafb0", "#e9e6dc", "#ddaa3b", "#7a5a7c"],
]

/** Generated artwork: every token id draws its own set of contour strata. */
function artwork(seed: number): string {
  const rand = mulberry32(seed)
  const pal = PALETTES[Math.floor(rand() * PALETTES.length)] as string[]
  let y = 0
  let bands = ""
  let i = 0
  while (y < 300) {
    const h = 14 + rand() * 46
    const c = pal[(i % (pal.length - 1)) + 1]
    const a = 20 + rand() * 30
    const b = 20 + rand() * 30
    bands += `<path d="M0 ${y + a / 3} C80 ${y - a} 180 ${y + b} 300 ${y + b / 4} V${y + h + 60} H0Z" fill="${c}" opacity="${(0.55 + rand() * 0.45).toFixed(2)}"/>`
    y += h
    i++
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="${pal[0]}"/>${bands}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function NftGrid() {
  const { d, locale } = useDict()
  const p = usePortfolio()
  const nfts = useMemo(
    () => p.demo.wallets.flatMap((w) => nftsOf(w, p.now)).filter((n) => p.demo.sync[n.network].syncedAt),
    [p.demo.wallets, p.demo.sync, p.now]
  )
  const walletLabel = (id: string) => p.demo.wallets.find((w) => w.id === id)?.label ?? ""
  if (nfts.length === 0) return <div className="rounded-xl border bg-card"><EmptyState title={d.holdings.nftsEmpty} /></div>
  const total = nfts.reduce((s, n) => s + n.estimateUsd, 0)
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t(d.holdings.nftCount, { count: nfts.length, value: usd(locale, total) })}</p>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {nfts.map((n) => (
          <li key={n.id}>
            <NftCard
              name={n.name}
              image={artwork(n.seed)}
              imageAlt=""
              collection={n.collection}
              className="h-full max-w-none gap-0 rounded-xl py-0 ring-border"
              price={usd(locale, n.estimateUsd)}
              priceSecondary={d.holdings.nftEstimate}
              collectionBadge={
                <span className="rounded-sm bg-background/90 px-1.5 py-0.5 font-mono text-[0.62rem] text-foreground">
                  {network(n.network).name}
                </span>
              }
            />
            <p className="mt-1 px-1 text-xs text-muted-foreground">
              {walletLabel(n.walletId)} · {t(d.holdings.nftAcquired, { date: date(locale, n.acquiredAt) })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
