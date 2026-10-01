"use client"

import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  CheckCheckIcon,
  ImageIcon,
  SparklesIcon,
  WaypointsIcon,
} from "lucide-react"

import { t } from "@/i18n/t"
import { useDict, type AppDict } from "@/i18n/provider"
import type { Locale } from "@/i18n/config"
import { network, shortAddress, txValueUsd, type TrackedWallet, type Tx } from "@/lib/demo"
import { amount, time, usd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { NetworkTag } from "./bits"

const ICONS = {
  receive: ArrowDownLeftIcon,
  send: ArrowUpRightIcon,
  swap: ArrowLeftRightIcon,
  bridge: WaypointsIcon,
  mint: SparklesIcon,
  "nft-transfer": ImageIcon,
  approve: CheckCheckIcon,
} as const

export function txTitle(tx: Tx, d: AppDict, locale: Locale): string {
  const fmt = (m?: Tx["in"]) => (m ? `${amount(locale, m.amount)} ${m.symbol}` : "")
  const T = d.activity.titles
  switch (tx.type) {
    case "receive":
      return t(T.receive, { amount: fmt(tx.in) })
    case "send":
      return t(T.send, { amount: fmt(tx.out) })
    case "swap":
      return t(T.swap, { out: fmt(tx.out), in: fmt(tx.in) })
    case "bridge":
      return t(T.bridge, { amount: fmt(tx.out), network: tx.toNetwork ? network(tx.toNetwork).name : "" })
    case "mint":
      return t(T.mint, { name: tx.nftName ?? "" })
    case "nft-transfer":
      return t(T["nft-transfer"], { name: tx.nftName ?? "" })
    case "approve":
      return t(T.approve, { token: tx.nftName ?? "", spender: tx.counterpartyLabel ?? "" })
  }
}

export function counterpartyLine(tx: Tx, d: AppDict): string {
  const who = tx.counterpartyLabel ?? (tx.counterparty ? shortAddress(tx.counterparty) : "")
  if (!who) return ""
  if (tx.type === "receive") return t(d.activity.from, { who })
  if (tx.type === "send" || tx.type === "nft-transfer") return t(d.activity.to, { who })
  return t(d.activity.via, { who })
}

export function ActivityRow({
  tx,
  wallet,
  now,
  onOpen,
  compact = false,
}: {
  tx: Tx
  wallet?: TrackedWallet
  now: number
  onOpen?: (tx: Tx) => void
  compact?: boolean
}) {
  const { d, locale } = useDict()
  const Icon = ICONS[tx.type]
  const value = txValueUsd(tx, now)
  const failed = tx.status === "failed"
  const inner = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border",
          tx.type === "receive" ? "text-gain" : "text-foreground",
          failed && "text-loss"
        )}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className={cn("truncate text-sm font-semibold", failed && "line-through decoration-1 opacity-70")}>{txTitle(tx, d, locale)}</span>
          {failed && <span className="label-mono shrink-0 rounded-sm bg-loss/10 px-1.5 py-0.5 text-[0.62rem] text-loss">{d.activity.failed}</span>}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <NetworkTag id={tx.network} />
          {!compact && wallet && <span>· {wallet.label}</span>}
          {!compact && counterpartyLine(tx, d) && <span className="hidden sm:inline">· {counterpartyLine(tx, d)}</span>}
          <span className="font-mono">· {time(locale, tx.timestamp)}</span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        {value > 0 && (
          <span className={cn("num block text-sm font-semibold", tx.type === "receive" && !failed && "text-gain")}>
            {tx.type === "receive" ? "+" : ""}
            {usd(locale, value)}
          </span>
        )}
        {tx.gasUsd > 0 && !compact && (
          <span className="num block font-mono text-[0.7rem] text-muted-foreground">{t(d.activity.gas, { value: usd(locale, tx.gasUsd) })}</span>
        )}
      </span>
    </>
  )
  if (!onOpen) return <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
  return (
    <button type="button" onClick={() => onOpen(tx)} className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60">
      {inner}
    </button>
  )
}
