"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { locales, switchLocalePath, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

/** Compact EN/FR switch that keeps the current page. */
export function LocaleSwitch({
  locale,
  label,
  names,
  className,
}: {
  locale: Locale
  label: string
  names: Record<Locale, string>
  className?: string
}) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <nav aria-label={label} className={cn("flex items-center rounded-md border p-0.5", className)}>
      {locales.map((l) => {
        const active = l === locale
        return (
          <Link
            key={l}
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            aria-label={names[l]}
            prefetch={false}
            className={cn(
              "inline-flex h-8 min-w-9 items-center justify-center rounded-[5px] px-2 font-mono text-xs font-medium uppercase transition-colors duration-150",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {l}
          </Link>
        )
      })}
    </nav>
  )
}
