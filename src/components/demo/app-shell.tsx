"use client"

import { ArrowLeftRightIcon, FileDownIcon, LayoutDashboardIcon, Layers3Icon, WalletCardsIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"
import { href } from "@/i18n/config"
import { useDict } from "@/i18n/provider"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

import { DemoControlsButton } from "./demo-controls"
import { Gate } from "./gate"
import { SyncSummary } from "./sync-summary"
import { WalletPrompt } from "./wallet-prompt"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { d, locale } = useDict()
  const demo = useDemo()
  const pathname = usePathname() ?? ""
  const base = href(locale, "/app")
  const items = [
    { href: base, label: d.nav.overview, icon: LayoutDashboardIcon },
    { href: `${base}/holdings`, label: d.nav.holdings, icon: Layers3Icon },
    { href: `${base}/activity`, label: d.nav.activity, icon: ArrowLeftRightIcon },
    { href: `${base}/wallets`, label: d.nav.wallets, icon: WalletCardsIcon },
    { href: `${base}/export`, label: d.nav.export, icon: FileDownIcon },
  ]
  const connected = demo.ready && demo.session === "connected"

  return (
    <div className="flex flex-1 flex-col">
      <WalletPrompt />
      {!demo.ready ? (
        <div className="mx-auto w-full max-w-[1320px] space-y-4 px-4 py-8 sm:px-6" aria-busy="true">
          <p className="sr-only" role="status">
            {d.gate.loading}
          </p>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !connected ? (
        <Gate />
      ) : (
        <div className="mx-auto flex w-full max-w-[1320px] flex-1 gap-8 px-4 pt-5 pb-12 sm:px-6">
          <aside className="sticky top-20 hidden h-[calc(100dvh-6rem)] w-52 shrink-0 flex-col gap-6 lg:flex">
            <nav aria-label={d.nav.label}>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = item.href === base ? pathname === base : pathname.startsWith(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors",
                          active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("size-4", active && "text-ochre-ink")} aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <SyncSummary />
            <div className="mt-auto space-y-3">
              <DemoControlsButton className="w-full" />
              <p className="label-mono text-muted-foreground">{d.common.demoBadge}</p>
            </div>
          </aside>
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
              <span className="label-mono rounded-full border px-2.5 py-1 text-muted-foreground">{d.common.demoBadge}</span>
              <DemoControlsButton compact />
            </div>
            {children}
          </div>
          <nav
            aria-label={d.nav.label}
            data-app-tabbar=""
            className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] lg:hidden"
          >
            <ul className="mx-auto grid max-w-lg grid-cols-5">
              {items.map((item) => {
                const active = item.href === base ? pathname === base : pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-16 flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold",
                        active ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden="true" />}
                      <item.icon className={cn("size-5", active && "text-ochre-ink")} aria-hidden="true" />
                      <span className="max-w-full truncate px-0.5">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
