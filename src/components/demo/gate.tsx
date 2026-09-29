"use client"

import { CircleAlertIcon, EyeIcon, KeyRoundIcon, LayersIcon, WalletIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useDict } from "@/i18n/provider"
import { NETWORKS } from "@/lib/demo"
import { requestConnect, useDemo } from "@/lib/demo/store"

/** Disconnected state of /app: explain the read-only sign-in, then connect. */
export function Gate() {
  const { d } = useDict()
  const demo = useDemo()
  const icons = [EyeIcon, LayersIcon, KeyRoundIcon]
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
      <div className="space-y-5">
        <p className="label-mono text-ochre-ink">{d.gate.eyebrow}</p>
        <h1 className="text-[clamp(2rem,5vw,3.25rem)] leading-[1.04] font-extrabold tracking-[-0.035em]">{d.gate.title}</h1>
        <p className="max-w-md text-lg text-muted-foreground">{d.gate.body}</p>
        {demo.session === "rejected" && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-loss/40 bg-loss/5 px-3 py-2.5 text-sm">
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-loss" aria-hidden="true" />
            {d.gate.rejected}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button size="lg" onClick={() => requestConnect()} className="rounded-full">
            <WalletIcon aria-hidden="true" />
            {demo.session === "rejected" ? d.common.retry : d.wallet.connect}
          </Button>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-bold">{d.gate.seesTitle}</h2>
        <ul className="mt-4 space-y-3">
          {d.gate.sees.map((s, i) => {
            const Icon = icons[i] ?? EyeIcon
            return (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {s}
              </li>
            )
          })}
        </ul>
        <div className="mt-6 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
          {NETWORKS.map((n) => (
            <span key={n.id} className="h-full flex-1 opacity-35" style={{ background: n.color }} />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.7rem] text-muted-foreground">
          {NETWORKS.map((n) => (
            <li key={n.id}>{n.name}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
