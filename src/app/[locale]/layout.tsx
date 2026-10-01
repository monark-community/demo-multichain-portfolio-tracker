import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google"
import { notFound } from "next/navigation"

import "../globals.css"

import { SiteFooter } from "@/components/site/footer"
import { SiteHeader } from "@/components/site/header"
import { ThemeProvider } from "@/components/site/theme"
import { Toaster } from "@/components/ui/sonner"
import { isLocale, locales, SITE_URL } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { DictProvider } from "@/i18n/provider"

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.title, template: d.titleTemplate },
    description: d.description,
    applicationName: "MultiTrack",
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: "MultiTrack",
      title: d.title,
      description: d.description,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: d.title, description: d.description },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#111714" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)

  return (
    <html lang={locale} className={`${schibsted.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <DictProvider locale={locale} d={{ ...dict.app, common: dict.common, networks: dict.networks }}>
            <a
              href="#main"
              className="sr-only z-50 rounded-md bg-foreground px-4 py-2 font-bold text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
              {dict.common.skip}
            </a>
            <SiteHeader locale={locale} dict={dict} />
            <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
              {children}
            </main>
            <SiteFooter locale={locale} dict={dict} />
            <Toaster />
          </DictProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
