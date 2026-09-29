import type { Metadata } from "next"

import { HoldingsView } from "@/components/demo/holdings-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/holdings">): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? { title: getDictionary(locale).app.holdings.title } : {}
}

export default function HoldingsPage() {
  return <HoldingsView />
}
