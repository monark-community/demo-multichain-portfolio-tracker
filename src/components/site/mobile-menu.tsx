"use client"

import { MenuIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Locale } from "@/i18n/config"

import { DemoChip } from "./demo-chip"
import { HeaderAction } from "./header-action"
import { LocaleSwitch } from "./locale-switch"
import { Wordmark } from "./logo"
import { NavLinks, type NavItem } from "./nav-links"
import { ThemeToggle } from "./theme"

export function MobileMenu({
  locale,
  items,
  appHref,
  labels,
}: {
  locale: Locale
  items: NavItem[]
  appHref: string
  labels: {
    open: string
    close: string
    nav: string
    launch: string
    demo: string
    theme: string
    language: string
    names: Record<Locale, string>
  }
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.open} className="md:hidden">
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={labels.close} className="flex w-full max-w-sm flex-col gap-0 p-0">
        <SheetHeader className="h-16 justify-center border-b px-5 text-left">
          <SheetTitle>
            <Wordmark />
          </SheetTitle>
          <SheetDescription className="sr-only">{labels.nav}</SheetDescription>
        </SheetHeader>
        <nav aria-label={labels.nav} className="flex-1 overflow-y-auto px-2 py-4">
          <NavLinks
            items={items}
            className="flex flex-col"
            itemClassName="h-12 w-full px-4 text-lg after:bottom-2 after:inset-x-4"
            onNavigate={() => setOpen(false)}
          />
        </nav>
        <div className="flex flex-col gap-4 border-t px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <DemoChip label={labels.demo} className="self-start" />
          <div className="flex items-center justify-between gap-3">
            <LocaleSwitch locale={locale} label={labels.language} names={labels.names} />
            <ThemeToggle label={labels.theme} />
          </div>
          <HeaderAction appHref={appHref} launchLabel={labels.launch} className="h-12 w-full justify-center" onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
