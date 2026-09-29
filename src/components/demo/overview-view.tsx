"use client"

import { ArrowRightIcon, TriangleAlertIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useDict } from "@/i18n/provider"
import { activityFor, history, network, NETWORKS, RANGES, type NetworkId, type Range } from "@/lib/demo"
import { retryNetwork } from "@/lib/demo/store"
import { amount, date, pct, signedUsd, usd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ActivityRow } from "./activity-row"
import { Delta, EmptyState, NetworkStack, PageTitle, Panel, TokenGlyph } from "./bits"
import { useAgo, usePortfolio } from "./hooks"
import { PerfChart } from "./perf-chart"
import { StrataBand } from "./strata-band"
import { SyncPanel } from "./sync-summary"

export function OverviewView() {
  const { d, locale } = useDict()
  const [filter, setFilter] = useState<NetworkId | null>(null)
  const [range, setRange] = useState<Range>("30d")
  const p = usePortfolio(filter)
  const since = useAgo()
  const { demo } = p
  const base = href(locale, "/app")

  const points = useMemo(() => history(p.scoped, range, p.now, p.tick), [p.scoped, range, p.now, p.tick])
  const first = points[0]?.v ?? 0
  const last = points[points.length - 1]?.v ?? 0
  const recent = useMemo(() => {
    const all = activityFor(demo.wallets, p.now)
    return (filter ? all.filter((tx) => tx.network === filter) : all).slice(0, 5)
  }, [demo.wallets, p.now, filter])

  const failed = NETWORKS.filter((n) => demo.sync[n.id].status === "failed")
  const everRead = NETWORKS.some((n) => demo.sync[n.id].syncedAt)
  const networksHeld = new Set(p.balances.map((b) => b.network)).size

  if (demo.wallets.length === 0) {
    return (
      <>
        <PageTitle title={d.overview.title} />
        <Panel>
          <EmptyState
            title={d.overview.noWalletsTitle}
            body={d.overview.noWalletsBody}
            action={
              <Button asChild>
                <Link href={`${base}/wallets`}>{d.overview.addWallet}</Link>
              </Button>
            }
          />
        </Panel>
      </>
    )
  }

  const layers = NETWORKS.map((n) => {
    const share = p.shares.find((s) => s.network === n.id)
    return {
      network: n.id,
      share: share?.share ?? 0,
      valueLabel: share ? usd(locale, share.valueUsd) : d.overview.notRead,
      shareLabel: share ? pct(locale, share.share, false, 0) : "—",
      stale: demo.sync[n.id].status === "failed" && !!demo.sync[n.id].syncedAt,
    }
  }).filter((l) => l.share > 0 || demo.sync[l.network].status !== "synced")

  return (
    <div className="space-y-5">
      <PageTitle
        title={d.overview.title}
        sub={t(d.overview.summary, { wallets: demo.wallets.length, networks: networksHeld })}
      />

      {failed.map((n) => (
        <div key={n.id} role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-loss/40 bg-loss/5 px-4 py-3 text-sm">
          <TriangleAlertIcon className="size-4 shrink-0 text-loss" aria-hidden="true" />
          <p className="min-w-0 flex-1">
            {demo.sync[n.id].syncedAt
              ? t(d.sync.staleBanner, { network: n.name, time: since(demo.sync[n.id].syncedAt ?? 0) })
              : t(d.sync.staleBannerNew, { network: n.name })}
          </p>
          <Button size="sm" variant="outline" onClick={() => void retryNetwork(n.id)}>
            {t(d.sync.retryNetwork, { network: n.name })}
          </Button>
        </div>
      ))}

      <section aria-labelledby="total-h" className="rounded-xl border bg-card">
        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div>
            <h2 id="total-h" className="label-mono text-muted-foreground">
              {filter ? t(d.overview.filtered, { network: network(filter).name }) : d.overview.total}
            </h2>
            <p className="num mt-1 text-[clamp(2.1rem,6vw,3.25rem)] leading-none font-extrabold tracking-[-0.035em]" aria-live="polite">
              {usd(locale, p.totals.valueUsd)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <Delta value={p.totals.change24hPct} label={`${signedUsd(locale, p.totals.change24hUsd)} (${pct(locale, p.totals.change24hPct, true)})`} />
                <span className="text-muted-foreground">{d.overview.change24h}</span>
              </span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
              <div>
                <dt className="text-muted-foreground">{d.overview.pnl}</dt>
                <dd className="mt-0.5">
                  <Delta value={p.totals.pnlUsd} label={signedUsd(locale, p.totals.pnlUsd)} />
                  <span className="num ml-1 text-xs text-muted-foreground">{pct(locale, p.totals.pnlPct, true)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{d.overview.cost}</dt>
                <dd className="num mt-0.5 font-semibold">{usd(locale, p.totals.costUsd)}</dd>
              </div>
            </dl>
            {filter && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilter(null)}>
                <XIcon aria-hidden="true" />
                {d.overview.clearFilter}
              </Button>
            )}
          </div>
          <div>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-bold">{d.overview.bandTitle}</h2>
              <p className="text-xs text-muted-foreground">{d.overview.bandHint}</p>
            </div>
            {everRead ? (
              <StrataBand
                layers={layers}
                selected={filter}
                onSelect={setFilter}
                ariaLabel={d.overview.bandAria}
                staleLabel={d.sync.failed}
                size="lg"
              />
            ) : (
              <EmptyState title={d.overview.emptyTitle} body={d.overview.emptyBody} />
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          id="perf-h"
          title={d.overview.perfTitle}
          action={
            <div role="group" aria-label={d.overview.perfTitle} className="flex rounded-md border p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={range === r}
                  aria-label={d.overview.rangeNames[r]}
                  onClick={() => setRange(r)}
                  className={cn(
                    "h-8 min-w-10 rounded-[5px] px-2 font-mono text-xs font-medium",
                    range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d.overview.ranges[r]}
                </button>
              ))}
            </div>
          }
        >
          <div className="p-4">
            <p className="mb-3 flex flex-wrap items-center gap-x-2 text-sm">
              <Delta
                value={first ? (last - first) / first : 0}
                label={`${signedUsd(locale, last - first)} (${pct(locale, first ? (last - first) / first : 0, true)})`}
              />
              <span className="text-muted-foreground">{d.overview.rangeNames[range]}</span>
              <span className="ml-auto text-xs text-muted-foreground">{d.overview.perfNote}</span>
            </p>
            <PerfChart
              points={points}
              formatValue={(v) => usd(locale, v, { compact: true })}
              formatDate={(tm) => date(locale, tm, range === "1y" || range === "90d" ? "medium" : "short")}
              ariaLabel={t(d.overview.chartAria, {
                range: d.overview.rangeNames[range],
                from: usd(locale, first),
                to: usd(locale, last),
              })}
            />
          </div>
        </Panel>
        <SyncPanel />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          id="top-h"
          title={d.overview.topTitle}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={`${base}/holdings`}>
                {d.overview.seeHoldings}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          {p.positions.length === 0 ? (
            <EmptyState title={d.overview.emptyTitle} body={d.overview.emptyBody} />
          ) : (
            <ul className="divide-y">
              {p.positions.slice(0, 5).map((pos) => (
                <li key={pos.symbol} className="flex items-center gap-3 px-4 py-3">
                  <TokenGlyph symbol={pos.symbol} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{pos.symbol}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="num font-mono">{amount(locale, pos.amount)}</span>
                      <NetworkStack ids={pos.networks} />
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="num text-sm font-semibold">{usd(locale, pos.valueUsd)}</p>
                    <Delta value={pos.change24hPct} label={pct(locale, pos.change24hPct, true)} className="text-xs" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel
          id="recent-h"
          title={d.overview.recentTitle}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={`${base}/activity`}>
                {d.overview.seeActivity}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {recent.map((tx) => (
              <li key={tx.hash}>
                <ActivityRow tx={tx} now={p.now} compact />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <p className="text-xs text-muted-foreground">
        {d.sync.pricesUpdated} · {d.common.moneyDisclaimer}
      </p>
    </div>
  )
}
