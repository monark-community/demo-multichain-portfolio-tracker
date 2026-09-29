import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "MultiTrack"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const LAYERS: [string, number][] = [
  ["#B07D12", 52],
  ["#4E7A3A", 13],
  ["#B0573A", 12],
  ["#3B6D70", 7],
  ["#7A5A7C", 6],
]

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F3F1EA", color: "#18211D", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, width: 64, height: 64, borderRadius: 14, background: "#18211D", padding: "0 14px" }}>
            <div style={{ height: 8, width: 36, borderRadius: 2, background: "#C8961E" }} />
            <div style={{ height: 8, width: 24, borderRadius: 2, background: "#F3F1EA" }} />
            <div style={{ height: 8, width: 30, borderRadius: 2, background: "#F3F1EA", opacity: 0.72 }} />
          </div>
          <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5 }}>MultiTrack</span>
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2.5, marginTop: 56, maxWidth: 980 }}>
          {d.home.hero.title}
        </div>
        <div style={{ display: "flex", gap: 6, height: 56, marginTop: "auto", borderRadius: 10, overflow: "hidden" }}>
          {LAYERS.map(([c, w]) => (
            <div key={c} style={{ display: "flex", flexGrow: w, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#555E58", marginTop: 20 }}>
          <span>{d.home.hero.eyebrow}</span>
          <span>{d.common.demoBadge}</span>
        </div>
      </div>
    ),
    size
  )
}
