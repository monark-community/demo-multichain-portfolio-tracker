import type { Metadata } from "next"

import { ActivityView } from "@/components/demo/activity-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/activity">): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? { title: getDictionary(locale).app.activity.title } : {}
}

export default function ActivityPage() {
  return <ActivityView />
}
