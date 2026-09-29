"use client"

import { Loader2Icon, ShieldCheckIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WalletAvatar, WalletAddress } from "@/components/ui/wallet"
import { useDict } from "@/i18n/provider"
import { MAIN_WALLET } from "@/lib/demo"
import { approveConnect, rejectConnect, useDemo } from "@/lib/demo/store"

/** The simulated wallet's sign-in request (pending → approved or rejected). */
export function WalletPrompt() {
  const { d } = useDict()
  const demo = useDemo()
  const [busy, setBusy] = useState(false)
  const open = demo.session === "connecting"

  async function approve() {
    setBusy(true)
    await approveConnect(d.walletLabels)
    setBusy(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !busy) rejectConnect()
      }}
    >
      <DialogContent closeLabel={d.common.close} className="max-w-[calc(100%-2rem)] rounded-xl p-0 sm:max-w-md">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <WalletAvatar address={MAIN_WALLET.address} size={36} />
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-bold">{d.wallet.demoName}</p>
            <WalletAddress address={MAIN_WALLET.address} className="text-xs text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-4 px-5 pt-1 pb-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-extrabold tracking-tight">{d.prompt.title}</DialogTitle>
            <DialogDescription>{d.prompt.body}</DialogDescription>
          </DialogHeader>
          <dl className="divide-y rounded-lg border bg-background text-sm">
            <div className="grid grid-cols-[6.5rem_1fr] gap-3 px-3 py-2.5">
              <dt className="text-muted-foreground">{d.prompt.site}</dt>
              <dd className="font-mono text-xs leading-5">multitrack.monark.io</dd>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr] gap-3 px-3 py-2.5">
              <dt className="text-muted-foreground">{d.prompt.message}</dt>
              <dd className="font-mono text-xs leading-5 break-words">{d.prompt.messageValue}</dd>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr] gap-3 px-3 py-2.5">
              <dt className="text-muted-foreground">{d.prompt.cost}</dt>
              <dd className="flex items-center gap-1.5 font-semibold text-gain">
                <ShieldCheckIcon className="size-4" aria-hidden="true" />
                {d.prompt.costValue}
              </dd>
            </div>
          </dl>
          {busy && (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              {d.prompt.waiting}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => rejectConnect()} disabled={busy}>
              {d.prompt.reject}
            </Button>
            <Button onClick={approve} disabled={busy}>
              {busy && <Loader2Icon className="animate-spin" aria-hidden="true" />}
              {d.prompt.approve}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
