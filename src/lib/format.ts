import { intlLocale, type Locale } from "@/i18n/config"

export function usd(locale: Locale, value: number, opts: { compact?: boolean; digits?: number } = {}): string {
  const digits = opts.digits ?? (Math.abs(value) < 1 && value !== 0 ? 4 : 2)
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    notation: opts.compact ? "compact" : "standard",
    minimumFractionDigits: opts.compact ? 0 : Math.min(2, digits),
    maximumFractionDigits: opts.compact ? 1 : digits,
  }).format(value)
}

export function signedUsd(locale: Locale, value: number): string {
  const s = usd(locale, Math.abs(value))
  if (Math.abs(value) < 0.005) return s
  return `${value > 0 ? "+" : "−"}${s}`
}

export function pct(locale: Locale, value: number, signed = false, digits = 2): string {
  const s = new Intl.NumberFormat(intlLocale[locale], {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(value))
  if (!signed || Math.abs(value) < 0.00005) return s
  return `${value > 0 ? "+" : "−"}${s}`
}

export function amount(locale: Locale, value: number, maxDigits?: number): string {
  const digits = maxDigits ?? (Math.abs(value) >= 1000 ? 2 : Math.abs(value) >= 1 ? 4 : 6)
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: digits }).format(value)
}

export function integer(locale: Locale, value: number): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(value)
}

export function date(locale: Locale, time: number, style: "short" | "medium" | "long" = "medium"): string {
  const opts: Intl.DateTimeFormatOptions =
    style === "short"
      ? { month: "short", day: "numeric" }
      : style === "long"
        ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
        : { year: "numeric", month: "short", day: "numeric" }
  return new Intl.DateTimeFormat(intlLocale[locale], opts).format(time)
}

export function dateTime(locale: Locale, time: number): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(time)
}

export function time(locale: Locale, t: number): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { hour: "2-digit", minute: "2-digit" }).format(t)
}

export function ago(
  labels: { secondsAgo: string; minutesAgo: string; hoursAgo: string; daysAgo: string },
  justNow: string,
  then: number,
  now: number
): string {
  const s = Math.max(0, Math.round((now - then) / 1000))
  if (s < 10) return justNow
  if (s < 60) return labels.secondsAgo.replace("{n}", String(s))
  const m = Math.round(s / 60)
  if (m < 60) return labels.minutesAgo.replace("{n}", String(m))
  const h = Math.round(m / 60)
  if (h < 48) return labels.hoursAgo.replace("{n}", String(h))
  return labels.daysAgo.replace("{n}", String(Math.round(h / 24)))
}
