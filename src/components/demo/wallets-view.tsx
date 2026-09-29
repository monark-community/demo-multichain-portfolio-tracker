"use client"

import { CheckIcon, CircleAlertIcon, Loader2Icon, PencilIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { useId, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WalletAddress, WalletAvatar, WalletCopyButton } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { useDict } from "@/i18n/provider"
import {
  balancesOf,
  checkAddress,
  livePrice,
  network,
  NETWORK_IDS,
  normalizeAddress,
  SAMPLE_EMPTY,
  SAMPLE_TRADING,
  SAMPLE_TYPO,
  type NetworkId,
  type TrackedWallet,
  type WalletTag,
} from "@/lib/demo"
import { addWallet, lookupAddress, removeWallet, updateWallet, type LookupResult } from "@/lib/demo/store"
import { usd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { EmptyState, NetworkStack, PageTitle } from "./bits"
import { usePortfolio } from "./hooks"

const TAGS: WalletTag[] = ["everyday", "cold", "trading", "savings", "other"]

export function WalletsView() {
  const { d, locale } = useDict()
  const p = usePortfolio()
  const { demo } = p
  const [editing, setEditing] = useState<TrackedWallet | null>(null)
  const [removing, setRemoving] = useState<TrackedWallet | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const values = useMemo(() => {
    const m = new Map<string, { value: number; networks: NetworkId[] }>()
    for (const w of demo.wallets) {
      const bs = balancesOf(w).filter((b) => demo.sync[b.network].syncedAt)
      m.set(w.id, {
        value: bs.reduce((s, b) => s + b.amount * livePrice(b.symbol, p.tick), 0),
        networks: NETWORK_IDS.filter((n) => bs.some((b) => b.network === n)),
      })
    }
    return m
  }, [demo.wallets, demo.sync, p.tick])
  const total = [...values.values()].reduce((s, v) => s + v.value, 0)

  return (
    <div className="space-y-6">
      <PageTitle
        title={d.wallets.title}
        sub={t(d.wallets.summary, { count: demo.wallets.length, value: usd(locale, total) })}
        action={
          <Button
            onClick={() => {
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              formRef.current?.querySelector("input")?.focus({ preventScroll: true })
            }}
          >
            {d.wallets.add}
          </Button>
        }
      />
      <section aria-label={d.wallets.title} className="overflow-hidden rounded-xl border bg-card">
        {demo.wallets.length === 0 ? (
          <EmptyState title={d.wallets.emptyTitle} body={d.wallets.emptyBody} />
        ) : (
          <ul className="divide-y">
            {demo.wallets.map((w) => {
              const v = values.get(w.id)
              return (
                <li key={w.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4">
                  <WalletAvatar address={w.address} size={40} />
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{w.label}</span>
                      <span className="label-mono rounded-sm bg-accent px-1.5 py-0.5 text-[0.6rem] text-accent-foreground">{d.tags[w.tag]}</span>
                      <span className="text-xs text-muted-foreground">{d.kinds[w.kind]}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <WalletAddress address={w.address} start={8} end={6} />
                      <WalletCopyButton address={w.address} copyLabel={d.common.copyAddress} copiedLabel={d.common.addressCopied} className="size-8" />
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="num font-semibold">{usd(locale, v?.value ?? 0)}</p>
                      <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                        <NetworkStack ids={v?.networks ?? []} />
                        {v?.networks.length ?? 0}
                        <span className="sr-only">{d.wallets.networks}</span>
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" aria-label={`${d.wallets.edit} · ${w.label}`} onClick={() => setEditing(w)}>
                      <PencilIcon aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${d.wallets.remove} · ${w.label}`}
                      onClick={() => (w.kind === "connected" ? toast(d.wallets.cantRemove) : setRemoving(w))}
                    >
                      <Trash2Icon aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div ref={formRef} className="scroll-mt-24">
        <AddWalletForm existing={demo.wallets} />
      </div>
      <p className="text-xs text-muted-foreground">{d.common.moneyDisclaimer}</p>

      <EditDialog wallet={editing} onClose={() => setEditing(null)} />
      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent closeLabel={d.common.close} className="max-w-[calc(100%-2rem)] rounded-xl sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-extrabold">{t(d.wallets.removeTitle, { label: removing?.label ?? "" })}</DialogTitle>
            <DialogDescription>{d.wallets.removeBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRemoving(null)}>
              {d.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (removing) {
                  removeWallet(removing.id)
                  toast(t(d.wallets.removed, { label: removing.label }))
                }
                setRemoving(null)
              }}
            >
              {d.wallets.removeConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TagPicker({ value, onChange, label }: { value: WalletTag; onChange: (t: WalletTag) => void; label: string }) {
  const { d } = useDict()
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          role="radio"
          aria-checked={value === tag}
          onClick={() => onChange(tag)}
          className={cn(
            "h-9 rounded-full border px-3 text-sm font-medium",
            value === tag ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          {d.tags[tag]}
        </button>
      ))}
    </div>
  )
}

function EditDialog({ wallet, onClose }: { wallet: TrackedWallet | null; onClose: () => void }) {
  const { d } = useDict()
  const id = useId()
  return (
    <Dialog open={!!wallet} onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={d.common.close} className="max-w-[calc(100%-2rem)] rounded-xl sm:max-w-md">
        {wallet && <EditForm key={wallet.id} wallet={wallet} onClose={onClose} id={id} />}
      </DialogContent>
    </Dialog>
  )
}

function EditForm({ wallet, onClose, id }: { wallet: TrackedWallet; onClose: () => void; id: string }) {
  const { d } = useDict()
  const [label, setLabel] = useState(wallet.label)
  const [tag, setTag] = useState<WalletTag>(wallet.tag)
  const invalid = !label.trim()
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (invalid) return
        updateWallet(wallet.id, { label: label.trim(), tag })
        toast(d.wallets.saved)
        onClose()
      }}
    >
      <DialogHeader className="text-left">
        <DialogTitle className="text-lg font-extrabold">{d.wallets.editTitle}</DialogTitle>
        <DialogDescription className="font-mono text-xs break-all">{wallet.address}</DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-label`}>{d.wallets.label}</Label>
        <Input id={`${id}-label`} value={label} onChange={(e) => setLabel(e.target.value)} aria-invalid={invalid} className="h-11" />
        {invalid && <p className="text-sm text-loss">{d.wallets.form.nameRequired}</p>}
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{d.wallets.tag}</p>
        <TagPicker value={tag} onChange={setTag} label={d.wallets.tag} />
      </div>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {d.common.cancel}
        </Button>
        <Button type="submit" disabled={invalid}>
          {d.wallets.save}
        </Button>
      </DialogFooter>
    </form>
  )
}

type Phase =
  | { k: "idle" }
  | { k: "looking"; done: NetworkId[] }
  | { k: "result"; r: LookupResult; address: string }

function AddWalletForm({ existing }: { existing: TrackedWallet[] }) {
  const { d, locale } = useDict()
  const F = d.wallets.form
  const id = useId()
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>({ k: "idle" })
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState(false)
  const [tag, setTag] = useState<WalletTag>("trading")

  function reset() {
    setPhase({ k: "idle" })
    setAddress("")
    setName("")
    setNameError(false)
    setError(null)
  }

  async function lookup(raw = address) {
    const c = checkAddress(raw)
    if (c === "empty") return setError(F.required)
    if (c === "invalid") return setError(F.invalid)
    const a = normalizeAddress(raw)
    const dup = existing.find((w) => w.address === a)
    if (dup) return setError(t(F.duplicate, { label: dup.label }))
    setError(null)
    setPhase({ k: "looking", done: [] })
    const r = await lookupAddress(a, (done) => setPhase({ k: "looking", done }))
    setPhase({ k: "result", r, address: a })
    if (r.status !== "failed" && !name) setName(a === SAMPLE_TRADING.address ? d.tags.trading : "")
  }

  function track() {
    if (phase.k !== "result") return
    if (!name.trim()) {
      setNameError(true)
      return
    }
    const w = addWallet(phase.address, name.trim(), tag)
    toast.success(t(F.added, { label: w.label }), { description: F.addedBody })
    reset()
  }

  const looking = phase.k === "looking"
  const result = phase.k === "result" ? phase.r : null

  return (
    <section aria-labelledby={`${id}-h`} className="rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 id={`${id}-h`} className="font-bold">
          {F.title}
        </h2>
        <p className="text-sm text-muted-foreground">{F.body}</p>
      </div>
      <div className="space-y-4 p-4">
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            void lookup()
          }}
        >
          <Label htmlFor={`${id}-addr`}>{F.address}</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id={`${id}-addr`}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                setError(null)
                if (phase.k === "result") setPhase({ k: "idle" })
              }}
              placeholder={F.placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-err` : undefined}
              disabled={looking}
              className="h-11 flex-1 font-mono text-sm"
            />
            <Button type="submit" className="h-11" disabled={looking}>
              {looking ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <SearchIcon aria-hidden="true" />}
              {F.lookup}
            </Button>
          </div>
          {error && (
            <p id={`${id}-err`} role="alert" className="flex items-start gap-1.5 text-sm text-loss">
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground">{F.samples}</span>
            {(
              [
                [F.sampleTrading, SAMPLE_TRADING.address],
                [F.sampleEmpty, SAMPLE_EMPTY],
                [F.sampleTypo, SAMPLE_TYPO],
              ] as const
            ).map(([label, a]) => (
              <button
                key={label}
                type="button"
                disabled={looking}
                onClick={() => {
                  setAddress(a)
                  setPhase({ k: "idle" })
                  void lookup(a)
                }}
                className="h-8 rounded-full border border-dashed px-3 text-xs font-medium text-muted-foreground hover:border-solid hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>
        </form>

        {phase.k === "looking" && (
          <div role="status" className="rounded-lg border bg-background p-3">
            <p className="mb-2 text-sm font-semibold">{t(F.looking, { count: NETWORK_IDS.length })}</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {NETWORK_IDS.map((n) => {
                const done = phase.done.includes(n)
                return (
                  <li key={n} className="flex items-center gap-2 text-sm">
                    <span className="h-3.5 w-1.5 rounded-[2px]" style={{ backgroundColor: network(n).color }} aria-hidden="true" />
                    <span className={cn("flex-1", !done && "text-muted-foreground")}>{network(n).name}</span>
                    {done ? (
                      <CheckIcon className="size-4 text-gain" aria-hidden="true" />
                    ) : (
                      <Loader2Icon className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {result?.status === "failed" && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-loss/40 bg-loss/5 p-3 text-sm">
            <CircleAlertIcon className="size-4 shrink-0 text-loss" aria-hidden="true" />
            <p className="flex-1">{t(F.failed, { network: network(result.network).name })}</p>
            <Button size="sm" variant="outline" onClick={() => void lookup(phase.k === "result" ? phase.address : address)}>
              {F.retryLookup}
            </Button>
          </div>
        )}

        {(result?.status === "found" || result?.status === "empty") && (
          <div className="space-y-4 rounded-lg border bg-background p-3 sm:p-4">
            {result.status === "found" ? (
              <div className="flex flex-wrap items-center gap-2" role="status">
                <CheckIcon className="size-4 text-gain" aria-hidden="true" />
                <p className="font-semibold">
                  {result.networks.length === 1
                    ? t(F.foundOne, { value: usd(locale, result.valueUsd) })
                    : t(F.found, { count: result.networks.length, value: usd(locale, result.valueUsd) })}
                </p>
                <NetworkStack ids={result.networks} />
              </div>
            ) : (
              <div role="status">
                <p className="font-semibold">{F.empty}</p>
                <p className="text-sm text-muted-foreground">{F.emptyBody}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-name`}>{F.name}</Label>
              <Input
                id={`${id}-name`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(false)
                }}
                placeholder={F.namePlaceholder}
                aria-invalid={nameError}
                className="h-11 max-w-sm"
              />
              {nameError && <p className="text-sm text-loss">{F.nameRequired}</p>}
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{d.wallets.tag}</p>
              <TagPicker value={tag} onChange={setTag} label={d.wallets.tag} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={track}>{result.status === "found" ? F.track : F.trackAnyway}</Button>
              <Button variant="outline" onClick={reset}>
                {d.common.cancel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
