import { CheckIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { cn } from "@/lib/utils"

// Internal strategy review only: never linked, not in the sitemap, noindex.
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {
    title: getDictionary(locale).meta.pricingTitle,
    robots: { index: false, follow: false },
  }
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const p = getDictionary(locale).pricing
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:py-20">
      <p className="label-mono text-ochre-ink">{p.eyebrow}</p>
      <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.035em]">{p.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{p.intro}</p>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {p.tiers.map((tier, i) => (
          <li
            key={tier.name}
            className={cn("flex flex-col rounded-xl border bg-card p-6", i === 1 && "border-foreground ring-1 ring-foreground")}
          >
            {i === 1 && <p className="label-mono mb-3 self-start rounded-sm bg-primary px-2 py-1 text-primary-foreground">{p.popular}</p>}
            <h2 className="text-xl font-extrabold">{tier.name}</h2>
            <p className="mt-3">
              <span className="num text-4xl font-extrabold tracking-tight">{tier.price}</span>
              {i > 0 && <span className="ml-1 text-muted-foreground">{p.perMonth}</span>}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{tier.note}</p>
            <ul className="mt-5 space-y-2 border-t pt-5 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-gain" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="mt-12 max-w-3xl">
        <h2 className="text-xl font-extrabold">{p.whyTitle}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
          {p.why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
