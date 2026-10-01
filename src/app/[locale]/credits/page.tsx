import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { href, isLocale, locales } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return {
    title: getDictionary(locale).meta.creditsTitle,
    alternates: { canonical: `/${locale}/credits`, languages: Object.fromEntries(locales.map((l) => [l, `/${l}/credits`])) },
  }
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale)
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em]">{d.credits.title}</h1>
      <p className="mt-3 text-muted-foreground">{d.credits.intro}</p>
      <ul className="mt-8 space-y-4">
        {Object.entries(PHOTOS).map(([key, p]) => (
          <li key={key} className="flex gap-4 rounded-xl border bg-card p-3">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-md">
              <Image src={p.src} alt="" fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0 self-center text-sm">
              <p className="font-semibold">
                <a href={p.page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  {t(d.credits.by, { name: p.name })}
                </a>
              </p>
              <p className="mt-1">
                <a href={p.profile} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted-foreground hover:text-foreground">
                  {p.profile.replace("https://", "")}
                </a>
              </p>
              <p className="mt-1 text-muted-foreground">
                {d.credits.usedOn}: {p.usedOn[locale]}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Link href={href(locale, "/")} className="mt-8 inline-flex min-h-10 items-center font-semibold text-ochre-ink underline underline-offset-4">
        {d.credits.back}
      </Link>
    </section>
  )
}
