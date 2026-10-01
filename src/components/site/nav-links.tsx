"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
  /** Match nested routes too (the demo lives under /app/*). */
  prefix?: boolean
}

export function NavLinks({
  items,
  className,
  itemClassName,
  onNavigate,
}: {
  items: NavItem[]
  className?: string
  itemClassName?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ""
  return (
    <ul className={className}>
      {items.map((item) => {
        const active = item.prefix ? pathname === item.href || pathname.startsWith(`${item.href}/`) : pathname === item.href
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "relative inline-flex h-10 items-center px-3 text-sm font-semibold transition-colors duration-150",
                "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-200",
                active ? "text-foreground after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:text-foreground",
                itemClassName
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
