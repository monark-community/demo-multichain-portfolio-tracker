import type { Metadata } from "next"

import { ExportView } from "@/components/demo/export-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/export">): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? { title: getDictionary(locale).app.export.title } : {}
}

export default function ExportPage() {
  return <ExportView />
}
