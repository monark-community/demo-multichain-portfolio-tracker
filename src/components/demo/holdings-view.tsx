"use client"

import { ChevronDownIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { t } from "@/i18n/t"
import { useDict } from "@/i18n/provider"
import {
  filterBalances,
  network,
  NETWORKS,
  positions as toPositions,
  type Horizon,
  type NetworkId,
  type Position,
} from "@/lib/demo"
import { setHorizon } from "@/lib/demo/store"
import { amount, pct, signedUsd, usd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Chip, Delta, EmptyState, NetworkStack, PageTitle, TokenGlyph } from "./bits"
import { usePortfolio } from "./hooks"
import { NftGrid } from "./nft-grid"

type Sort = "value" | "change" | "pnl"

export function HoldingsView() {
  const { d, locale } = useDict()
  const p = usePortfolio()
  const { demo } = p
  const [net, setNet] = useState<NetworkId | null>(null)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [horizon, setHorizonFilter] = useState<Horizon | "all">("all")
  const [hideDust, setHideDust] = useState(false)
  const [sort, setSort] = useState<Sort>("value")
  const [open, setOpen] = useState<string | null>(null)

  const list = useMemo(() => {
    const scoped = filterBalances(
      p.balances,
      { networks: net ? [net] : undefined, walletIds: walletId ? [walletId] : undefined, horizon },
      demo.horizons,
      p.tick,
      hideDust
    )
    const out = toPositions(scoped, demo.horizons, p.tick, p.now)
    const key: Record<Sort, (x: Position) => number> = {
      value: (x) => x.valueUsd,
      change: (x) => x.change24hPct,
      pnl: (x) => x.pnlUsd,
    }
    return out.sort((a, b) => key[sort](b) - key[sort](a))
  }, [p.balances, p.tick, p.now, net, walletId, horizon, hideDust, sort, demo.horizons])

  const total = list.reduce((s, x) => s + x.valueUsd, 0)
  const walletLabel = (id: string) => demo.wallets.find((w) => w.id === id)?.label ?? ""
  const filtered = net || walletId || horizon !== "all" || hideDust
  const clear = () => {
    setNet(null)
    setWalletId(null)
    setHorizonFilter("all")
    setHideDust(false)
  }

  return (
    <div>
      <PageTitle title={d.holdings.title} sub={t(d.holdings.summary, { count: list.length, value: usd(locale, total) })} />
      <Tabs defaultValue="tokens">
        <TabsList className="mb-4">
          <TabsTrigger value="tokens">{d.holdings.tokens}</TabsTrigger>
          <TabsTrigger value="nfts">{d.holdings.nfts}</TabsTrigger>
        </TabsList>
        <TabsContent value="tokens" className="space-y-4">
          <section aria-label={d.holdings.filters} className="space-y-3 rounded-xl border bg-card p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono w-20 shrink-0 text-muted-foreground">{d.holdings.network}</span>
              <div className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 pb-0.5">
                <Chip active={!net} onClick={() => setNet(null)}>
                  {d.holdings.allNetworks}
                </Chip>
                {NETWORKS.map((n) => (
                  <Chip key={n.id} active={net === n.id} onClick={() => setNet(net === n.id ? null : n.id)}>
                    <span className="h-3 w-1.5 rounded-[2px]" style={{ backgroundColor: n.color }} aria-hidden="true" />
                    {n.name}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono w-20 shrink-0 text-muted-foreground">{d.holdings.wallet}</span>
              <div className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 pb-0.5">
                <Chip active={!walletId} onClick={() => setWalletId(null)}>
                  {d.holdings.allWallets}
                </Chip>
                {demo.wallets.map((w) => (
                  <Chip key={w.id} active={walletId === w.id} onClick={() => setWalletId(walletId === w.id ? null : w.id)}>
                    {w.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono w-20 shrink-0 text-muted-foreground">{d.holdings.horizon}</span>
              <div className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 pb-0.5">
                {(["all", "long", "short", "none"] as const).map((h) => (
                  <Chip key={h} active={horizon === h} onClick={() => setHorizonFilter(h)}>
                    {d.horizons[h]}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Switch checked={hideDust} onCheckedChange={setHideDust} aria-label={d.holdings.hideDust} />
                {d.holdings.hideDust}
              </label>
              <div role="group" aria-label={d.holdings.sort} className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">{d.holdings.sort}</span>
                {(
                  [
                    ["value", d.holdings.sortValue],
                    ["change", d.holdings.sortChange],
                    ["pnl", d.holdings.sortPnl],
                  ] as const
                ).map(([k, label]) => (
                  <Chip key={k} active={sort === k} onClick={() => setSort(k)} className="h-8 px-2.5 text-xs">
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
          </section>

          <section aria-label={d.holdings.tokens} className="overflow-hidden rounded-xl border bg-card">
            <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_2.5rem] gap-3 border-b px-4 py-2.5 text-xs font-semibold text-muted-foreground md:grid">
              <span>{d.holdings.asset}</span>
              <span className="text-right">{d.holdings.price}</span>
              <span className="text-right">{d.holdings.balance}</span>
              <span className="text-right">{d.holdings.value}</span>
              <span className="text-right">{d.holdings.pnl}</span>
              <span />
            </div>
            {list.length === 0 ? (
              <EmptyState
                title={d.holdings.emptyTitle}
                body={d.holdings.emptyBody}
                action={
                  filtered ? (
                    <Button variant="outline" onClick={clear}>
                      {d.holdings.clearFilters}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="divide-y">
                {list.map((pos) => {
                  const isOpen = open === pos.symbol
                  const panelId = `pos-${pos.symbol}`
                  return (
                    <li key={pos.symbol}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        aria-label={t(d.holdings.details, { symbol: pos.symbol })}
                        onClick={() => setOpen(isOpen ? null : pos.symbol)}
                        className="grid w-full grid-cols-[minmax(0,1fr)_auto_1.5rem] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 md:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_2.5rem]"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <TokenGlyph symbol={pos.symbol} />
                          <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-semibold">
                              {pos.symbol}
                              {pos.horizon !== "none" && (
                                <span className="label-mono rounded-sm bg-accent px-1.5 py-0.5 text-[0.6rem] text-accent-foreground">
                                  {d.horizons[pos.horizon]}
                                </span>
                              )}
                            </span>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              <NetworkStack ids={pos.networks} />
                              {pos.networks.length === 1 ? d.holdings.networkCount : t(d.holdings.networksCount, { count: pos.networks.length })}
                            </span>
                          </span>
                        </span>
                        <span className="num hidden text-right text-sm md:block">
                          {usd(locale, pos.price)}
                          <Delta value={pos.change24hPct} label={pct(locale, pos.change24hPct, true)} className="block text-xs" />
                        </span>
                        <span className="num hidden text-right font-mono text-sm md:block">{amount(locale, pos.amount)}</span>
                        <span className="num text-right text-sm font-semibold">
                          {usd(locale, pos.valueUsd)}
                          <span className="block font-mono text-xs font-normal text-muted-foreground md:hidden">
                            {amount(locale, pos.amount)} {pos.symbol}
                          </span>
                        </span>
                        <span className="hidden text-right text-sm md:block">
                          <Delta value={pos.pnlUsd} label={signedUsd(locale, pos.pnlUsd)} className="justify-end" />
                          <span className="num block text-xs text-muted-foreground">{pct(locale, pos.pnlPct, true)}</span>
                        </span>
                        <ChevronDownIcon
                          className={cn("size-4 justify-self-end text-muted-foreground transition-transform", isOpen && "rotate-180")}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && <PositionDetail id={panelId} pos={pos} walletLabel={walletLabel} />}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </TabsContent>
        <TabsContent value="nfts">
          <NftGrid />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PositionDetail({ id, pos, walletLabel }: { id: string; pos: Position; walletLabel: (id: string) => string }) {
  const { d, locale } = useDict()
  const byNet = new Map<NetworkId, number>()
  for (const part of pos.parts) byNet.set(part.network, (byNet.get(part.network) ?? 0) + part.amount * pos.price)
  const avg = pos.amount > 0 ? pos.costUsd / pos.amount : 0
  return (
    <div id={id} className="space-y-4 border-t bg-background/60 px-4 py-4">
      <div>
        <h3 className="mb-2 text-sm font-bold">{d.holdings.split}</h3>
        <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-sm" aria-hidden="true">
          {[...byNet.entries()].map(([n, v]) => (
            <span key={n} className="animate-strata h-full" style={{ flexGrow: v, flexBasis: 0, backgroundColor: network(n).color }} />
          ))}
        </div>
        <ul className="mt-2 divide-y rounded-lg border bg-card">
          {pos.parts.map((part) => (
            <li key={`${part.walletId}-${part.network}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
              <span className="h-4 w-2 rounded-[2px]" style={{ backgroundColor: network(part.network).color }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="font-medium">{network(part.network).name}</span>
                <span className="text-muted-foreground"> · {walletLabel(part.walletId)}</span>
              </span>
              <span className="num font-mono text-xs text-muted-foreground">
                {amount(locale, part.amount)} {pos.symbol}
              </span>
              <span className="num w-24 text-right font-semibold">{usd(locale, part.amount * pos.price)}</span>
            </li>
          ))}
        </ul>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">{d.holdings.avgCost}</dt>
          <dd className="num font-semibold">{usd(locale, avg)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{d.holdings.costBasis}</dt>
          <dd className="num font-semibold">{usd(locale, pos.costUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{d.holdings.unrealized}</dt>
          <dd>
            <Delta value={pos.pnlUsd} label={`${signedUsd(locale, pos.pnlUsd)} (${pct(locale, pos.pnlPct, true)})`} />
          </dd>
        </div>
      </dl>
      <div role="radiogroup" aria-label={d.holdings.horizonLabel} className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">{d.holdings.horizonLabel}</span>
        {(["long", "short", "none"] as const).map((h) => (
          <button
            key={h}
            type="button"
            role="radio"
            aria-checked={pos.horizon === h}
            onClick={() => {
              setHorizon(pos.symbol, h)
              toast(t(d.holdings.tagged, { symbol: pos.symbol, horizon: d.horizons[h].toLowerCase() }))
            }}
            className={cn(
              "h-9 rounded-md border px-3 text-sm font-medium",
              pos.horizon === h ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-muted"
            )}
          >
            {d.horizons[h]}
          </button>
        ))}
      </div>
    </div>
  )
}
