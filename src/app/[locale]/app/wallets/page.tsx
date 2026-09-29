import type { Metadata } from "next"

import { WalletsView } from "@/components/demo/wallets-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/wallets">): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? { title: getDictionary(locale).app.wallets.title } : {}
}

export default function WalletsPage() {
  return <WalletsView />
}
