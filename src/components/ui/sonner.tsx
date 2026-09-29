"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const QUERY = "(min-width: 768px)"
function subscribe(cb: () => void) {
  const m = window.matchMedia(QUERY)
  m.addEventListener("change", cb)
  return () => m.removeEventListener("change", cb)
}

/**
 * Toasts never cover what they report on: top-right under the header on
 * desktop, above the app's bottom tab bar on phones.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true
  )

  return (
    <Sonner
      theme={(resolvedTheme ?? "light") as ToasterProps["theme"]}
      position={desktop ? "top-right" : "bottom-center"}
      offset={{ top: 76, right: 20 }}
      mobileOffset={{ bottom: "calc(84px + env(safe-area-inset-bottom))", left: 12, right: 12 }}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-[0_8px_24px_rgb(24_33_29/0.14)] group-[.toaster]:rounded-lg group-[.toaster]:font-sans",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
