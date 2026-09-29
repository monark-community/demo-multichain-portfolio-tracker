import Link from "next/link"
import { locale as rootLocale } from "next/root-params"

import { Button } from "@/components/ui/button"
import { defaultLocale, href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

async function currentLocale(): Promise<Locale> {
  const value = await rootLocale()
  return value && isLocale(value) ? value : defaultLocale
}

export default async function NotFound() {
  const locale = await currentLocale()
  const d = getDictionary(locale)
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
      <div className="mb-8 flex h-10 w-64 gap-[3px] overflow-hidden rounded-md" aria-hidden="true">
        <span className="flex-[3] bg-chart-1" />
        <span className="hatched flex-[2] bg-chart-3" />
        <span className="flex-1 border border-dashed bg-transparent" />
      </div>
      <p className="label-mono text-ochre-ink">404</p>
      <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">{d.notFound.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">{d.notFound.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg" className="rounded-full">
          <Link href={href(locale, "/app")}>{d.notFound.demo}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link href={href(locale, "/")}>{d.notFound.home}</Link>
        </Button>
      </div>
    </section>
  )
}
