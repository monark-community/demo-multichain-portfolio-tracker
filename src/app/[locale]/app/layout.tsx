import type { Metadata } from "next"

import { AppShell } from "@/components/demo/app-shell"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export async function generateMetadata({ params }: LayoutProps<"/[locale]/app">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return {
    title: d.meta.appTitle,
    alternates: { canonical: `/${locale}/app`, languages: { en: "/en/app", fr: "/fr/app" } },
  }
}

export default function AppLayout({ children }: LayoutProps<"/[locale]/app">) {
  return <AppShell>{children}</AppShell>
}
