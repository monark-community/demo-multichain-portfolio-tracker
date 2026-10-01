import Link from "next/link"

import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { DemoChip } from "./demo-chip"
import { HeaderAction } from "./header-action"
import { LocaleSwitch } from "./locale-switch"
import { Wordmark } from "./logo"
import { MobileMenu } from "./mobile-menu"
import { NavLinks } from "./nav-links"
import { ThemeToggle } from "./theme"

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: href(locale, "/"), label: dict.nav.product },
    { href: href(locale, "/how-it-works"), label: dict.nav.how },
    { href: href(locale, "/app"), label: dict.nav.demo, prefix: true },
  ]
  const names = { en: "English", fr: "Français" }
  const appHref = href(locale, "/app")
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3 px-4 sm:px-6">
        <Link href={href(locale, "/")} className="-ml-1 rounded-md px-1 py-1" aria-label="MultiTrack">
          <Wordmark />
        </Link>
        <nav aria-label={dict.nav.label} className="ml-6 hidden md:block">
          <NavLinks items={items} className="flex items-center gap-1" />
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <DemoChip label={dict.common.demoBadge} className="hidden lg:inline-flex" />
          <LocaleSwitch locale={locale} label={dict.common.language} names={names} />
          <ThemeToggle label={dict.common.theme} />
          <HeaderAction appHref={appHref} launchLabel={dict.common.openDemo} />
        </div>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ThemeToggle label={dict.common.theme} />
          <MobileMenu
            locale={locale}
            items={items}
            appHref={appHref}
            labels={{
              open: dict.common.menu,
              close: dict.common.close,
              nav: dict.nav.label,
              launch: dict.common.openDemo,
              demo: dict.common.demoBadge,
              theme: dict.common.theme,
              language: dict.common.language,
              names,
            }}
          />
        </div>
      </div>
    </header>
  )
}
