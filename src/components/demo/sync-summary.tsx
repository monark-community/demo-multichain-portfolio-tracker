"use client"

import { CheckIcon, Loader2Icon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { useDict } from "@/i18n/provider"
import { NETWORKS, type NetworkId, type NetworkSync } from "@/lib/demo"
import { retryNetwork, syncAll, useDemo } from "@/lib/demo/store"
import { integer } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAgo } from "./hooks"

export function syncCounts(sync: Record<NetworkId, NetworkSync>) {
  const values = NETWORKS.map((n) => sync[n.id])
  return {
    done: values.filter((s) => s.status === "synced").length,
    busy: values.some((s) => s.status === "queued" || s.status === "syncing"),
    failed: NETWORKS.filter((n) => sync[n.id].status === "failed").map((n) => n.id),
    total: NETWORKS.length,
  }
}

export function StatusIcon({ status, className }: { status: NetworkSync["status"]; className?: string }) {
  if (status === "synced") return <CheckIcon className={cn("size-3.5 text-gain", className)} aria-hidden="true" />
  if (status === "failed") return <TriangleAlertIcon className={cn("size-3.5 text-loss", className)} aria-hidden="true" />
  if (status === "syncing") return <Loader2Icon className={cn("size-3.5 animate-spin text-ochre-ink", className)} aria-hidden="true" />
  return <span className={cn("block size-2 rounded-full border border-muted-foreground", className)} aria-hidden="true" />
}

/** Compact sync state for the desktop rail. */
export function SyncSummary() {
  const { d } = useDict()
  const demo = useDemo()
  const c = syncCounts(demo.sync)
  return (
    <section aria-labelledby="rail-sync" className="rounded-lg border bg-card p-3">
      <h2 id="rail-sync" className="label-mono text-muted-foreground">
        {d.sync.title}
      </h2>
      <p className="mt-1 text-sm font-semibold" aria-live="polite">
        {t(d.sync.summary, { done: c.done, total: c.total })}
      </p>
      <ul className="mt-2 space-y-1.5">
        {NETWORKS.map((n) => (
          <li key={n.id} className="flex items-center gap-2 text-xs">
            <span className="h-3 w-1.5 rounded-sm" style={{ backgroundColor: n.color }} aria-hidden="true" />
            <span className="flex-1 truncate text-muted-foreground">{n.name}</span>
            <StatusIcon status={demo.sync[n.id].status} />
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => void syncAll()} disabled={c.busy}>
        <RefreshCwIcon className={cn(c.busy && "animate-spin")} aria-hidden="true" />
        {c.busy ? d.sync.refreshing : d.sync.refresh}
      </Button>
    </section>
  )
}

/** Full per-network read list (the survey sweep) for the overview. */
export function SyncPanel() {
  const { d, locale } = useDict()
  const demo = useDemo()
  const since = useAgo()
  const c = syncCounts(demo.sync)
  return (
    <section aria-labelledby="sync-panel" className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 id="sync-panel" className="font-bold">
            {d.sync.title}
          </h2>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {t(d.sync.summary, { done: c.done, total: c.total })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void syncAll()} disabled={c.busy}>
          <RefreshCwIcon className={cn(c.busy && "animate-spin")} aria-hidden="true" />
          {c.busy ? d.sync.refreshing : d.sync.refresh}
        </Button>
      </div>
      <ul className="divide-y">
        {NETWORKS.map((n) => {
          const s = demo.sync[n.id]
          const label =
            s.status === "syncing"
              ? t(d.sync.syncing, { block: integer(locale, s.progressBlock ?? 0) })
              : s.status === "synced"
                ? t(d.sync.synced, { block: integer(locale, s.block ?? 0) })
                : s.status === "failed"
                  ? d.sync.failed
                  : s.status === "queued"
                    ? d.sync.queued
                    : d.sync.idle
          return (
            <li key={n.id} className="relative flex min-h-14 items-center gap-3 overflow-hidden px-4 py-2">
              {s.status === "syncing" && (
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-sweep bg-gradient-to-r from-transparent via-accent/70 to-transparent" aria-hidden="true" />
              )}
              <span className={cn("relative h-7 w-2 rounded-sm", s.status === "failed" && "hatched")} style={{ backgroundColor: n.color }} aria-hidden="true" />
              <div className="relative min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{n.name}</p>
                <p className={cn("font-mono text-xs", s.status === "failed" ? "text-loss" : "text-muted-foreground")}>
                  {label}
                  {s.status === "synced" && s.syncedAt ? ` · ${since(s.syncedAt)}` : ""}
                </p>
              </div>
              <StatusIcon status={s.status} className="relative" />
              {s.status === "failed" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="relative"
                  onClick={() => void retryNetwork(n.id)}
                  aria-label={t(d.sync.retryNetwork, { network: n.name })}
                >
                  {d.sync.retry}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
