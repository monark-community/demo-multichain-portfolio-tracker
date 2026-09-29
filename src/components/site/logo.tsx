import { cn } from "@/lib/utils"

/** The strata mark: a core sample and a stacked allocation bar at once. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="7" fill="var(--foreground)" />
      <rect x="7" y="8" width="18" height="4" rx="1" fill="var(--primary)" />
      <rect x="7" y="14" width="12" height="4" rx="1" fill="var(--background)" />
      <rect x="7" y="20" width="15" height="4" rx="1" fill="var(--background)" opacity="0.72" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[1.15rem] font-extrabold tracking-[-0.03em]">
        Multi<span className="font-medium">Track</span>
      </span>
    </span>
  )
}
