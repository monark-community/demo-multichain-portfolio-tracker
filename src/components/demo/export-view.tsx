"use client"

import { CheckIcon, CircleAlertIcon, DownloadIcon, FileSpreadsheetIcon, Loader2Icon, RotateCcwIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { useDict } from "@/i18n/provider"
import { activityFor, taxYears, type CostMethod, type ExportResult, type ReportKind } from "@/lib/demo"
import { MissingPricesError, runExport, type ExportStep } from "@/lib/demo/store"
import { signedUsd, usd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Delta, PageTitle } from "./bits"
import { InfoTip } from "./info-tip"
import { usePortfolio } from "./hooks"

type Phase =
  | { k: "form" }
  | { k: "running"; step: ExportStep }
  | { k: "failed"; count: number }
  | { k: "ready"; result: ExportResult; nearest: boolean }

const STEPS: ExportStep[] = ["gather", "price", "compute"]

export function ExportView() {
  const { d, locale } = useDict()
  const E = d.export
  const id = useId()
  const p = usePortfolio()
  const { demo } = p
  const years = useMemo(() => taxYears(demo.wallets, p.now), [demo.wallets, p.now])
  const currentYear = new Date(p.now).getUTCFullYear()
  const [year, setYear] = useState<number>(() => years.find((y) => y < currentYear) ?? years[0] ?? currentYear)
  const [walletIds, setWalletIds] = useState<string[]>(() => demo.wallets.map((w) => w.id))
  const [method, setMethod] = useState<CostMethod>("acb")
  const [kind, setKind] = useState<ReportKind>("gains")
  const [phase, setPhase] = useState<Phase>({ k: "form" })

  const selected = demo.wallets.filter((w) => walletIds.includes(w.id))
  const txCount = useMemo(
    () => activityFor(selected, p.now).filter((tx) => new Date(tx.timestamp).getUTCFullYear() === year).length,
    [selected, p.now, year]
  )

  async function generate(nearest = false) {
    if (walletIds.length === 0) return
    setPhase({ k: "running", step: "gather" })
    try {
      const result = await runExport({ year, walletIds, method, kind }, E.csv, (step) => setPhase({ k: "running", step }), { nearestPrice: nearest })
      setPhase({ k: "ready", result, nearest })
    } catch (e) {
      if (e instanceof MissingPricesError) setPhase({ k: "failed", count: e.count })
      else {
        toast.error(d.common.genericError)
        setPhase({ k: "form" })
      }
    }
  }

  function download(r: ExportResult) {
    try {
      const blob = new Blob([`﻿${r.csv}`], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = r.fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success(t(E.downloaded, { file: r.fileName }))
    } catch {
      toast.error(d.common.genericError)
    }
  }

  const methodName = method === "acb" ? E.acb : E.fifo
  const busy = phase.k === "running"

  return (
    <div className="space-y-5">
      <PageTitle title={E.title} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          className="space-y-5 rounded-xl border bg-card p-4 sm:p-5"
          onSubmit={(e) => {
            e.preventDefault()
            void generate()
          }}
        >
          <fieldset disabled={busy} className="space-y-2">
            <legend className="mb-2 text-sm font-bold">{E.year}</legend>
            <div className="flex flex-wrap gap-2">
              {years.map((y) => (
                <label key={y} className={radioCard(year === y, "h-10 px-4")}>
                  <input type="radio" name={`${id}-year`} className="sr-only" checked={year === y} onChange={() => setYear(y)} />
                  <span className="num font-semibold">{y === currentYear ? t(E.yearToDate, { year: y }) : y}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={busy} className="space-y-2">
            <legend className="mb-2 text-sm font-bold">{E.wallets}</legend>
            <div className="flex flex-wrap gap-2">
              {demo.wallets.map((w) => {
                const on = walletIds.includes(w.id)
                return (
                  <label key={w.id} className={radioCard(on, "h-10 gap-2 px-3")}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => setWalletIds(on ? walletIds.filter((x) => x !== w.id) : [...walletIds, w.id])}
                    />
                    <span className={cn("flex size-4 items-center justify-center rounded-[4px] border", on && "border-foreground bg-foreground text-background")} aria-hidden="true">
                      {on && <CheckIcon className="size-3" />}
                    </span>
                    <span className="text-sm font-medium">{w.label}</span>
                  </label>
                )
              })}
            </div>
            {walletIds.length === 0 && <p className="text-sm text-loss">{E.noWallets}</p>}
          </fieldset>
          <fieldset disabled={busy}>
            <legend className="mb-2 text-sm font-bold">{E.method}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["acb", E.acb, E.acbBody],
                  ["fifo", E.fifo, E.fifoBody],
                ] as const
              ).map(([k, title, body]) => (
                <label key={k} className={radioCard(method === k, "flex-col items-start p-3")}>
                  <input type="radio" name={`${id}-method`} className="sr-only" checked={method === k} onChange={() => setMethod(k)} />
                  <span className="text-sm font-bold">{title}</span>
                  <span className="text-xs text-muted-foreground">{body}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={busy}>
            <legend className="mb-2 text-sm font-bold">{E.report}</legend>
            <div className="grid gap-2">
              {(["gains", "transactions", "holdings"] as const).map((k) => (
                <label key={k} className={radioCard(kind === k, "items-start gap-3 p-3")}>
                  <input type="radio" name={`${id}-kind`} className="sr-only" checked={kind === k} onChange={() => setKind(k)} />
                  <FileSpreadsheetIcon className="mt-0.5 size-4 shrink-0 text-ochre-ink" aria-hidden="true" />
                  <span className="text-sm font-bold">{E.kinds[k]}</span>
                  <InfoTip label={E.kindsBody[k]} className="ml-auto" />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <Button type="submit" size="lg" disabled={busy || walletIds.length === 0}>
              {busy && <Loader2Icon className="animate-spin" aria-hidden="true" />}
              {E.generate}
            </Button>
          </div>
        </form>

        <section aria-live="polite" aria-label={E.readyTitle} className="rounded-xl border bg-card p-4 sm:p-5">
          {phase.k === "form" && (
            <div className="flex h-full min-h-60 flex-col items-center justify-center gap-3 text-center">
              <FileSpreadsheetIcon className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="max-w-xs text-sm text-muted-foreground">
                {t(E.steps.gather, { count: txCount })} · {E.kinds[kind]} · {methodName}
              </p>
            </div>
          )}
          {phase.k === "running" && (
            <ol className="space-y-3" role="status">
              {STEPS.map((s, i) => {
                const idx = STEPS.indexOf(phase.step)
                const state = i < idx ? "done" : i === idx ? "active" : "todo"
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border font-mono text-xs",
                        state === "done" && "border-gain text-gain",
                        state === "active" && "border-foreground"
                      )}
                    >
                      {state === "done" ? <CheckIcon className="size-4" aria-hidden="true" /> : state === "active" ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : i + 1}
                    </span>
                    <span className={cn(state === "todo" && "text-muted-foreground", state === "active" && "font-semibold")}>
                      {s === "gather" ? t(E.steps.gather, { count: txCount }) : s === "price" ? E.steps.price : t(E.steps.compute, { method: methodName })}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
          {phase.k === "failed" && (
            <div role="alert" className="space-y-3">
              <p className="flex items-start gap-2 font-semibold text-loss">
                <CircleAlertIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                {t(E.failedTitle, { count: phase.count })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void generate(true)}>{E.useNearest}</Button>
                <Button variant="outline" onClick={() => setPhase({ k: "form" })}>
                  {d.common.cancel}
                </Button>
              </div>
            </div>
          )}
          {phase.k === "ready" && (
            <div className="space-y-4">
              <div>
                <p className="flex items-center gap-2 font-bold">
                  <CheckIcon className="size-5 text-gain" aria-hidden="true" />
                  {E.readyTitle}
                </p>
                <p className="mt-0.5 font-mono text-xs break-all text-muted-foreground">
                  {t(E.readyBody, { rows: phase.result.rowCount, file: phase.result.fileName })}
                </p>
                {phase.nearest && <p className="mt-1 text-xs text-ochre-ink">{E.nearestNote}</p>}
              </div>
              <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-background p-3 text-sm sm:grid-cols-3">
                <Stat label={E.txs} value={String(phase.result.txCount)} />
                <Stat label={E.disposals} value={String(phase.result.disposals)} />
                <Stat label={E.gasPaid} value={usd(locale, phase.result.gasUsd)} />
                <Stat label={E.proceeds} value={usd(locale, phase.result.proceedsUsd)} />
                <Stat label={E.costBasis} value={usd(locale, phase.result.costUsd)} />
                <div>
                  <dt className="text-xs text-muted-foreground">{E.gain}</dt>
                  <dd>
                    <Delta value={phase.result.gainUsd} label={signedUsd(locale, phase.result.gainUsd)} />
                  </dd>
                </div>
              </dl>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{E.preview}</p>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left font-mono text-[0.7rem]">
                    <thead className="bg-muted">
                      <tr>
                        {phase.result.previewHeader.map((h) => (
                          <th key={h} scope="col" className="px-2 py-1.5 font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {phase.result.preview.map((row, i) => (
                        <tr key={i}>
                          {row.map((c, j) => (
                            <td key={j} className="max-w-40 truncate px-2 py-1.5 whitespace-nowrap">
                              {c}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => download(phase.result)}>
                  <DownloadIcon aria-hidden="true" />
                  {E.download}
                </Button>
                <Button variant="outline" onClick={() => setPhase({ k: "form" })}>
                  <RotateCcwIcon aria-hidden="true" />
                  {E.again}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{d.common.taxDisclaimer}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="num font-semibold">{value}</dd>
    </div>
  )
}

function radioCard(active: boolean, extra: string) {
  return cn(
    "flex cursor-pointer items-center rounded-md border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
    active ? "border-foreground bg-accent" : "bg-card hover:bg-muted",
    extra
  )
}
