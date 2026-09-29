import { ArrowRightIcon, CheckIcon, XIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { href, isLocale, locales, REPO_URL } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { NETWORKS } from "@/lib/demo"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return {
    title: d.meta.howTitle,
    description: d.how.intro,
    alternates: { canonical: `/${locale}/how-it-works`, languages: Object.fromEntries(locales.map((l) => [l, `/${l}/how-it-works`])) },
  }
}

export default async function HowPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const stateStyles = ["border", "animate-none", "", "hatched"]

  return (
    <>
      <section className="border-b">
        <div className="mx-auto max-w-[1320px] px-4 pt-12 pb-10 sm:px-6 md:pt-16">
          <p className="label-mono text-ochre-ink">{h.eyebrow}</p>
          <h1 className="mt-4 max-w-[20ch] text-[clamp(2.1rem,5vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance">
            {h.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{h.intro}</p>
        </div>
        <div className="relative h-40 w-full overflow-hidden sm:h-56">
          <Image src={PHOTOS.strata.src} alt="" fill sizes="100vw" className="object-cover object-[50%_60%]" placeholder="blur" />
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold tracking-[-0.03em]">{h.pipelineTitle}</h2>
          <Pipeline labels={h.diagram} aria={h.pipelineAria} />
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {h.steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-foreground pt-4">
                <p className="font-mono text-xs text-ochre-ink">0{i + 1}</p>
                <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b bg-paper-deep">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold tracking-[-0.03em]">{h.promiseTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { title: h.reads.title, items: h.reads.items, Icon: CheckIcon, tone: "text-gain" },
              { title: h.never.title, items: h.never.items, Icon: XIcon, tone: "text-loss" },
            ].map((col) => (
              <div key={col.title} className="rounded-xl border bg-card p-5">
                <h3 className="label-mono text-muted-foreground">{col.title}</h3>
                <ul className="mt-3 space-y-2.5">
                  {col.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5">
                      <col.Icon className={`mt-0.5 size-4 shrink-0 ${col.tone}`} aria-hidden="true" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold tracking-[-0.03em]">{h.freshTitle}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{h.freshBody}</p>
          </div>
          <ul className="divide-y rounded-xl border bg-card">
            {h.states.map((s, i) => (
              <li key={s.name} className="flex items-start gap-4 p-4">
                <span
                  className={`mt-1 h-8 w-3 shrink-0 rounded-sm ${stateStyles[i] ?? ""}`}
                  style={{ backgroundColor: i === 0 ? "transparent" : NETWORKS[4]?.color, opacity: i === 1 ? 0.55 : 1 }}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="rounded-xl border bg-foreground p-6 text-background sm:p-8">
            <h2 className="text-xl font-extrabold">{h.devTitle}</h2>
            <p className="mt-3 opacity-85">{h.devBody}</p>
            <pre className="mt-5 overflow-x-auto rounded-md bg-background/10 p-3 font-mono text-xs leading-relaxed">
              <code>{`src/lib/demo/
  catalog.ts    networks, tokens
  holdings.ts   balances per address
  activity.ts   normalized history
  prices.ts     price at any time
  tax.ts        ACB / FIFO exports
  store.ts      sync engine, latency`}</code>
            </pre>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-10 items-center gap-2 font-semibold text-primary underline underline-offset-4 dark:text-[#7f5b06]"
            >
              {h.devRepo}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </a>
          </div>
          <div>
            <Button asChild size="lg" className="rounded-full">
              <Link href={href(locale, "/app")}>
                {h.cta}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">{dict.common.moneyDisclaimer}</p>
          </div>
        </div>
      </section>
    </>
  )
}

function Pipeline({ labels, aria }: { labels: { wallets: string; readers: string; normalize: string; price: string; view: string }; aria: string }) {
  const nodes = [labels.wallets, labels.readers, labels.normalize, labels.price, labels.view]
  return (
    <div role="img" aria-label={aria} className="mt-8 rounded-xl border bg-card p-4 sm:p-6">
      <ol className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-0">
        {nodes.map((n, i) => (
          <li key={n} className="flex flex-1 flex-col items-stretch md:flex-row md:items-center">
            <div
              className={`flex min-h-20 flex-1 flex-col justify-center gap-2 rounded-lg border px-3 py-3 ${i === 4 ? "border-foreground bg-foreground text-background" : "bg-background"}`}
            >
              <span className="font-mono text-[0.65rem] opacity-70">0{i + 1}</span>
              <span className="text-sm font-bold">{n}</span>
              {i === 0 && (
                <span className="flex gap-1" aria-hidden="true">
                  {[0, 1, 2].map((k) => (
                    <span key={k} className="size-3 rounded-full border border-foreground/40 bg-accent" />
                  ))}
                </span>
              )}
              {i === 1 && (
                <span className="flex gap-1" aria-hidden="true">
                  {NETWORKS.map((nw) => (
                    <span key={nw.id} className="h-3 w-2 rounded-[2px]" style={{ backgroundColor: nw.color }} />
                  ))}
                </span>
              )}
              {i === 4 && (
                <span className="flex h-2.5 gap-px overflow-hidden rounded-[2px]" aria-hidden="true">
                  {NETWORKS.map((nw, k) => (
                    <span key={nw.id} style={{ flexGrow: [5, 2, 1.4, 1, 0.8][k], flexBasis: 0, backgroundColor: nw.color }} />
                  ))}
                </span>
              )}
            </div>
            {i < nodes.length - 1 && (
              <span className="flex h-5 items-center justify-center md:h-auto md:w-6" aria-hidden="true">
                <span className="h-full w-px bg-foreground/40 md:h-px md:w-full" />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
