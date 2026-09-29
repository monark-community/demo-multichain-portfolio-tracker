"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { useDict } from "@/i18n/provider"
import { MAIN_WALLET } from "@/lib/demo"
import { disconnect, requestConnect, useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

/** "Open the demo" on marketing pages; the wallet connection inside the app. */
export function HeaderAction({
  appHref,
  launchLabel,
  className,
  onNavigate,
}: {
  appHref: string
  launchLabel: string
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ""
  const inApp = pathname === appHref || pathname.startsWith(`${appHref}/`)
  const { d } = useDict()
  const demo = useDemo()

  if (!inApp) {
    return (
      <Button asChild className={cn("rounded-full px-5", className)}>
        <Link href={appHref} onClick={onNavigate}>
          {launchLabel}
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </Button>
    )
  }

  if (!demo.ready) return <span className={cn("inline-block h-10 w-40", className)} aria-hidden="true" />

  const main = demo.wallets.find((w) => w.kind === "connected")
  const status = demo.session === "connected" ? "connected" : demo.session === "connecting" ? "connecting" : "disconnected"
  return (
    <ConnectWallet
      status={status}
      address={main?.address ?? MAIN_WALLET.address}
      name={d.wallet.demoName}
      connectLabel={d.wallet.connect}
      connectingLabel={d.wallet.connecting}
      disconnectLabel={d.wallet.disconnect}
      onConnect={() => {
        onNavigate?.()
        requestConnect()
      }}
      onDisconnect={() => {
        onNavigate?.()
        disconnect()
      }}
      className={cn(status === "connected" ? "h-11 py-1.5" : "rounded-full", className)}
    />
  )
}
