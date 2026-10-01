import { ArrowDownLeftIcon, ArrowLeftRightIcon, CheckIcon, TriangleAlertIcon, WaypointsIcon } from "lucide-react"

import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { network, type NetworkId } from "@/lib/demo"
import { integer, usd } from "@/lib/format"

type Mini = Dictionary["home"]["features"]["mini"]

/** Small, static slices of the real UI, one per feature card. Decorative. */
export function FeatureMini({ kind, labels, locale }: { kind: number; labels: Mini; locale: Locale }) {
  if (kind === 0) {
    const split: [NetworkId, number][] = [
      ["eth-sepolia", 3250],
      ["base-sepolia", 1412.36],
      ["arb-sepolia", 640.12],
      ["polygon-amoy", 388.4],
    ]
    return (
      <div aria-hidden="true" className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full border bg-card font-mono text-[0.62rem]">USD</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">tUSDC</p>
            <p className="text-xs text-muted-foreground">{labels.merged}</p>
          </div>
          <p className="num text-sm font-bold">{usd(locale, 5690.88)}</p>
        </div>
        <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-sm">
          {split.map(([n, v]) => (
            <span key={n} style={{ flexGrow: v, flexBasis: 0, backgroundColor: network(n).color }} />
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {split.map(([n, v]) => (
            <li key={n} className="flex items-center gap-1.5">
              <span className="h-3 w-1.5 rounded-[2px]" style={{ backgroundColor: network(n).color }} />
              <span className="truncate text-muted-foreground">{network(n).name}</span>
              <span className="num ml-auto font-medium">{usd(locale, v, { digits: 0 })}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (kind === 1) {
    const rows: [NetworkId, "ok" | "fail", number][] = [
      ["eth-sepolia", "ok", 9874512],
      ["base-sepolia", "ok", 35413790],
      ["polygon-amoy", "fail", 30418207],
    ]
    return (
      <ul aria-hidden="true" className="divide-y rounded-lg border bg-card">
        {rows.map(([n, s, b]) => (
          <li key={n} className="flex items-center gap-3 px-3 py-2">
            <span className={`h-6 w-1.5 rounded-sm ${s === "fail" ? "hatched" : ""}`} style={{ backgroundColor: network(n).color }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{network(n).name}</span>
              <span className={`block font-mono text-[0.68rem] ${s === "fail" ? "text-loss" : "text-muted-foreground"}`}>
                {s === "fail" ? labels.failed : `${labels.synced} · #${integer(locale, b)}`}
              </span>
            </span>
            {s === "ok" ? (
              <CheckIcon className="size-4 text-gain" />
            ) : (
              <span className="flex items-center gap-2">
                <TriangleAlertIcon className="size-4 text-loss" />
                <span className="rounded-md border px-2 py-1 text-xs font-semibold">{labels.retry}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    )
  }
  if (kind === 2) {
    return (
      <div aria-hidden="true" className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">{labels.cold}</span>
          <span className="rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">{labels.trading}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            ["tWBTC", labels.long],
            ["tETH", labels.long],
            ["tARB", labels.short],
          ].map(([s, h]) => (
            <span key={s} className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-xs">
              <span className="font-semibold">{s}</span>
              <span className="label-mono rounded-sm bg-accent px-1.5 py-0.5 text-[0.58rem] text-accent-foreground">{h}</span>
            </span>
          ))}
        </div>
      </div>
    )
  }
  const lines = [
    { icon: ArrowLeftRightIcon, text: labels.swap, n: "arb-sepolia" as NetworkId, v: 119.64 },
    { icon: WaypointsIcon, text: labels.bridge, n: "eth-sepolia" as NetworkId, v: 641.2 },
    { icon: ArrowDownLeftIcon, text: labels.receive, n: "polygon-amoy" as NetworkId, v: 250 },
  ]
  return (
    <ul aria-hidden="true" className="space-y-2">
      {lines.map((l) => (
        <li key={l.text} className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
          <l.icon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">{l.text}</span>
            <span className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
              <span className="h-2.5 w-1 rounded-[1px]" style={{ backgroundColor: network(l.n).color }} />
              {network(l.n).name}
            </span>
          </span>
          <span className="num text-xs font-semibold">{usd(locale, l.v)}</span>
        </li>
      ))}
    </ul>
  )
}
