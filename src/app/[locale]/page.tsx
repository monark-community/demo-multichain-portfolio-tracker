import { ArrowRightIcon, FileSpreadsheetIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HeroCard } from "@/components/home/hero-card"
import { FeatureMini } from "@/components/home/feature-mini"
import { Button } from "@/components/ui/button"
import { href, intlLocale, isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { balancesOf, byNetwork, COLD_WALLET, MAIN_WALLET, network, NETWORKS, positions, totals, type TrackedWallet } from "@/lib/demo"
import { amount, pct, usd } from "@/lib/format"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {
    alternates: { canonical: `/${locale}`, languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
  }
}

function sample(): TrackedWallet[] {
  return [
    { id: "main", address: MAIN_WALLET.address, label: "", tag: "everyday", kind: "connected", addedAt: 0 },
    { id: "cold", address: COLD_WALLET.address, label: "", tag: "cold", kind: "watch", addedAt: 0 },
  ]
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home
  const balances = sample().flatMap(balancesOf)
  const list = positions(balances, {}, 0, Date.UTC(2026, 8, 29))
  const tot = totals(list)
  const shares = byNetwork(balances, 0)
  const appHref = href(locale, "/app")

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="contour pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_left,black,transparent_70%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 pt-12 pb-16 sm:px-6 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-center lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <p className="label-mono text-ochre-ink">{h.hero.eyebrow}</p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance">
              {h.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{h.hero.sub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href={appHref}>
                  {h.hero.primary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href={href(locale, "/how-it-works")}>{h.hero.secondary}</Link>
              </Button>
            </div>
          </div>
          <HeroCard
            total={tot.valueUsd}
            totalLabel={usd(locale, tot.valueUsd)}
            format={{ locale: intlLocale[locale] }}
            layers={shares.map((s) => ({
              network: s.network,
              color: network(s.network).color,
              name: network(s.network).name,
              share: s.share,
              value: pct(locale, s.share, false, 0),
            }))}
            positions={list.slice(0, 3).map((p) => ({
              symbol: p.symbol,
              amount: `${amount(locale, p.amount)} ${p.symbol}`,
              value: usd(locale, p.valueUsd),
              colors: p.networks.map((n) => network(n).color),
            }))}
            labels={{ total: h.hero.cardTotal, synced: h.hero.cardSynced, positions: h.hero.cardPositions, aria: h.hero.cardAria }}
          />
        </div>
      </section>

      {/* Problem */}
      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <h2 className="max-w-[20ch] text-[clamp(1.75rem,3.5vw,2.6rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
              {h.problem.title}
            </h2>
            <p className="mt-4 max-w-xl text-lg opacity-80">{h.problem.body}</p>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-background/20 pt-6">
            {h.problem.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="num block text-[clamp(2.5rem,6vw,4rem)] leading-none font-extrabold text-primary dark:text-[#7f5b06]">{s.value}</span>
                  <span className="mt-2 block text-sm opacity-80">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Strata */}
      <section className="border-b">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={PHOTOS.strata.src}
              alt={h.strata.photoAlt}
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover"
              placeholder="blur"
            />
          </div>
          <div>
            <p className="label-mono text-ochre-ink">{h.strata.eyebrow}</p>
            <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">{h.strata.title}</h2>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{h.strata.body}</p>
            <div className="mt-8 rounded-xl border bg-card p-4" aria-hidden="true">
              <div className="flex h-10 gap-[3px] overflow-hidden rounded-md">
                {shares.map((s) => (
                  <span
                    key={s.network}
                    className={s.network === "polygon-amoy" ? "hatched" : undefined}
                    style={{ flexGrow: s.share, flexBasis: 0, backgroundColor: network(s.network).color }}
                  />
                ))}
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm">
                <span className="hatched h-4 w-2.5 rounded-[3px]" style={{ backgroundColor: network("polygon-amoy").color }} />
                <span className="font-semibold">{network("polygon-amoy").name}</span>
                <span className="text-loss">· {h.strata.stale}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 md:py-24">
          <p className="label-mono text-ochre-ink">{h.features.eyebrow}</p>
          <h2 className="mt-3 max-w-2xl text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
            {h.features.title}
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {h.features.items.slice(0, 3).map((f, i) => (
              <li key={f.title} className="flex flex-col overflow-hidden rounded-xl border bg-card">
                <div className="border-b bg-background/70 p-4 sm:p-5">
                  <FeatureMini kind={i} labels={h.features.mini} locale={locale} />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-muted-foreground">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tax */}
      <section className="border-b">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
          <div className="lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={PHOTOS.desk.src}
                alt={h.tax.photoAlt}
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
                placeholder="blur"
              />
            </div>
          </div>
          <div>
            <p className="label-mono text-ochre-ink">{h.tax.eyebrow}</p>
            <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">{h.tax.title}</h2>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{h.tax.body}</p>
            <div className="mt-6 flex max-w-md items-center gap-4 rounded-xl border bg-card p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent">
                <FileSpreadsheetIcon className="size-5 text-ochre-ink" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs">{h.tax.file}</p>
                <p className="text-xs text-muted-foreground">{h.tax.rows}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.7rem] text-muted-foreground">{h.tax.gain}</p>
                <p className="num font-bold text-gain">+{usd(locale, 4182.37)}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="lg" className="mt-6 rounded-full">
              <Link href={href(locale, "/app/export")}>
                {h.tax.cta}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative overflow-hidden bg-accent">
        <div className="contour pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-[1320px] flex-col items-start gap-6 px-4 py-16 sm:px-6 md:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">{h.closing.title}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{h.closing.body}</p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Button asChild size="lg" variant="ink" className="rounded-full">
              <Link href={appHref}>
                {h.closing.cta}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <div className="flex h-2 w-56 gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
              {NETWORKS.map((n) => (
                <span key={n.id} className="flex-1" style={{ backgroundColor: n.color }} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
