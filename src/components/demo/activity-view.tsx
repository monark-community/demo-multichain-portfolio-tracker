"use client"

import { ExternalLinkIcon, Loader2Icon, SearchIcon, TriangleAlertIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { TxStatus } from "@/components/ui/tx-status"
import { t } from "@/i18n/t"
import { useDict } from "@/i18n/provider"
import { activityFor, network, NETWORKS, shortAddress, type NetworkId, type Tx, type TxType } from "@/lib/demo"
import { loadMore } from "@/lib/demo/store"
import { amount, date, dateTime, integer, usd } from "@/lib/format"

import { ActivityRow, txTitle } from "./activity-row"
import { Chip, EmptyState, PageTitle } from "./bits"
import { usePortfolio } from "./hooks"

const PAGE = 20
type TypeFilter = "all" | "receive" | "send" | "swap" | "bridge" | "nft" | "approve"
const TYPE_MATCH: Record<TypeFilter, TxType[] | null> = {
  all: null,
  receive: ["receive"],
  send: ["send"],
  swap: ["swap"],
  bridge: ["bridge"],
  nft: ["mint", "nft-transfer"],
  approve: ["approve"],
}

export function ActivityView() {
  const { d, locale } = useDict()
  const p = usePortfolio()
  const { demo } = p
  const [q, setQ] = useState("")
  const [type, setType] = useState<TypeFilter>("all")
  const [net, setNet] = useState<NetworkId | null>(null)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)
  const [loading, setLoading] = useState<"idle" | "loading" | "failed">("idle")
  const [openTx, setOpenTx] = useState<Tx | null>(null)

  const all = useMemo(
    () => activityFor(demo.wallets, p.now).filter((tx) => demo.sync[tx.network].syncedAt),
    [demo.wallets, demo.sync, p.now]
  )
  const walletOf = (id: string) => demo.wallets.find((w) => w.id === id)
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const types = TYPE_MATCH[type]
    return all.filter((tx) => {
      if (types && !types.includes(tx.type)) return false
      if (net && tx.network !== net) return false
      if (walletId && tx.walletId !== walletId) return false
      if (!needle) return true
      const hay = [tx.hash, tx.counterparty, tx.counterpartyLabel, tx.in?.symbol, tx.out?.symbol, tx.nftName, network(tx.network).name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return hay.includes(needle)
    })
  }, [all, q, type, net, walletId])

  const visible = filtered.slice(0, shown)
  const groups = useMemo(() => {
    const out: { key: string; label: string; items: Tx[] }[] = []
    const today = new Date(p.now).toDateString()
    const yesterday = new Date(p.now - 86_400_000).toDateString()
    for (const tx of visible) {
      const key = new Date(tx.timestamp).toDateString()
      let g = out[out.length - 1]
      if (!g || g.key !== key) {
        const label = key === today ? d.activity.today : key === yesterday ? d.activity.yesterday : date(locale, tx.timestamp, "long")
        g = { key, label, items: [] }
        out.push(g)
      }
      g.items.push(tx)
    }
    return out
  }, [visible, p.now, d, locale])

  const resetPaging = () => {
    setShown(PAGE)
    setLoading("idle")
  }

  async function more() {
    setLoading("loading")
    const r = await loadMore()
    if (r === "failed") {
      setLoading("failed")
      return
    }
    setShown((s) => s + PAGE)
    setLoading("idle")
  }

  const networksUsed = new Set(all.map((tx) => tx.network)).size

  return (
    <div>
      <PageTitle title={d.activity.title} sub={t(d.activity.summary, { count: all.length, networks: networksUsed })} />
      <section aria-label={d.holdings.filters} className="mb-4 space-y-3 rounded-xl border bg-card p-3 sm:p-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              resetPaging()
            }}
            placeholder={d.activity.search}
            aria-label={d.activity.searchLabel}
            className="h-11 pl-9"
          />
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {(Object.keys(TYPE_MATCH) as TypeFilter[]).map((k) => (
            <Chip
              key={k}
              active={type === k}
              onClick={() => {
                setType(k)
                resetPaging()
              }}
            >
              {d.activity.types[k]}
            </Chip>
          ))}
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {NETWORKS.map((n) => (
            <Chip
              key={n.id}
              active={net === n.id}
              onClick={() => {
                setNet(net === n.id ? null : n.id)
                resetPaging()
              }}
            >
              <span className="h-3 w-1.5 rounded-[2px]" style={{ backgroundColor: n.color }} aria-hidden="true" />
              {n.name}
            </Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-border" aria-hidden="true" />
          {demo.wallets.map((w) => (
            <Chip
              key={w.id}
              active={walletId === w.id}
              onClick={() => {
                setWalletId(walletId === w.id ? null : w.id)
                resetPaging()
              }}
            >
              {w.label}
            </Chip>
          ))}
        </div>
      </section>

      <section aria-label={d.activity.title} className="overflow-hidden rounded-xl border bg-card">
        {filtered.length === 0 ? (
          <EmptyState
            title={q.trim() ? t(d.activity.emptySearch, { q: q.trim() }) : d.activity.emptyFilters}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQ("")
                  setType("all")
                  setNet(null)
                  setWalletId(null)
                  resetPaging()
                }}
              >
                <XIcon aria-hidden="true" />
                {q.trim() ? d.activity.clearSearch : d.holdings.clearFilters}
              </Button>
            }
          />
        ) : (
          <>
            {groups.map((g) => (
              <div key={g.key}>
                <h2 className="flex items-center justify-between border-b bg-muted px-4 py-1.5 text-xs font-semibold">
                  <span>{g.label}</span>
                  <span className="font-mono font-normal text-muted-foreground">{t(d.activity.txCount, { count: g.items.length })}</span>
                </h2>
                <ul className="divide-y">
                  {g.items.map((tx) => (
                    <li key={tx.hash}>
                      <ActivityRow tx={tx} wallet={walletOf(tx.walletId)} now={p.now} onOpen={setOpenTx} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {loading === "loading" && (
              <div className="space-y-3 border-t px-4 py-3" aria-busy="true">
                <p role="status" className="sr-only">
                  {d.activity.loadingMore}
                </p>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t px-4 py-4 text-center">
              {loading === "failed" && (
                <p role="alert" className="mb-3 flex items-center justify-center gap-2 text-sm text-loss">
                  <TriangleAlertIcon className="size-4" aria-hidden="true" />
                  {d.activity.loadFailed}
                </p>
              )}
              {shown < filtered.length ? (
                <Button variant="outline" onClick={() => void more()} disabled={loading === "loading"}>
                  {loading === "loading" && <Loader2Icon className="animate-spin" aria-hidden="true" />}
                  {loading === "failed" ? d.common.retry : loading === "loading" ? d.activity.loadingMore : d.activity.loadMore}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">{d.activity.end}</p>
              )}
            </div>
          </>
        )}
      </section>
      <TxSheet tx={openTx} onClose={() => setOpenTx(null)} walletLabel={(id) => walletOf(id)?.label ?? ""} />
    </div>
  )
}

function TxSheet({ tx, onClose, walletLabel }: { tx: Tx | null; onClose: () => void; walletLabel: (id: string) => string }) {
  const { d, locale } = useDict()
  const S = d.activity.sheet
  const n = tx ? network(tx.network) : null
  const rows: [string, React.ReactNode][] = tx && n
    ? [
        [S.network, n.name],
        [S.wallet, walletLabel(tx.walletId)],
        ...(tx.out ? ([[S.sent, `${amount(locale, tx.out.amount)} ${tx.out.symbol}`]] as [string, string][]) : []),
        ...(tx.in ? ([[S.received, `${amount(locale, tx.in.amount)} ${tx.in.symbol}`]] as [string, string][]) : []),
        [
          S.counterparty,
          tx.counterparty ? (
            <span key="cp" className="font-mono text-xs break-all">
              {tx.counterpartyLabel ? `${tx.counterpartyLabel} · ` : ""}
              {shortAddress(tx.counterparty, 10, 8)}
            </span>
          ) : (
            "—"
          ),
        ],
        [S.gas, tx.gasNative > 0 ? `${amount(locale, tx.gasNative, 7)} ${tx.gasSymbol} · ${usd(locale, tx.gasUsd)}` : "—"],
        [S.block, <span key="b" className="font-mono">{integer(locale, tx.block)}</span>],
        [S.time, dateTime(locale, tx.timestamp)],
      ]
    : []
  return (
    <Sheet open={!!tx} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" closeLabel={d.common.close} className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        {tx && n && (
          <>
            <SheetHeader className="border-b px-5 py-4 pr-14 text-left">
              <p className="label-mono text-muted-foreground">{S.title}</p>
              <SheetTitle className="text-lg leading-snug font-extrabold">{txTitle(tx, d, locale)}</SheetTitle>
              <SheetDescription className="sr-only">{n.name}</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-5 py-4">
              <TxStatus
                status={tx.status}
                hash={tx.hash}
                label={tx.status === "confirmed" ? S.confirmed : S.failed}
                className="w-full justify-between"
              />
              <dl className="divide-y rounded-lg border text-sm">
                {rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 px-3 py-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="num min-w-0">{v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <Button asChild variant="outline" className="w-full">
                  <a href={`${n.explorer}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                    {S.explorer}
                    <ExternalLinkIcon aria-hidden="true" />
                  </a>
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">{S.explorerNote}</p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
