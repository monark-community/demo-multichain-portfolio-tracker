import Link from "next/link"

import { href, MONARK_URL, PROJECT_DOC_URL, REPO_URL, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

import { Wordmark } from "./logo"

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const internal = [
    { href: href(locale, "/"), label: dict.nav.product },
    { href: href(locale, "/how-it-works"), label: dict.nav.how },
    { href: href(locale, "/app"), label: dict.nav.demo },
    { href: href(locale, "/credits"), label: dict.nav.credits },
  ]
  const external = [
    { href: REPO_URL, label: dict.nav.github },
    { href: PROJECT_DOC_URL, label: dict.nav.projectPage },
  ]
  return (
    <footer className="border-t bg-paper-deep">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <Wordmark />
          <p className="max-w-sm text-sm text-muted-foreground">{dict.footer.line}</p>
        </div>
        <nav aria-label={dict.footer.links}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {internal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-9 items-center text-muted-foreground hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
            {external.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center text-muted-foreground hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-4 py-4 text-[0.8rem] text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="label-mono text-foreground">{dict.common.demoBadge}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              © {new Date().getFullYear()} {dict.footer.rights}
            </span>
            <a href={MONARK_URL} target="_blank" rel="noopener noreferrer" className="text-[0.78rem] hover:text-foreground">
              {dict.common.builtWith}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
