import { cn } from "@/lib/utils"

/** The one "Demo · simulated data" marker in the header (plus the footer line). */
export function DemoChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 font-mono text-[0.68rem] font-medium tracking-wide text-ochre-ink uppercase",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
      {label}
    </span>
  )
}
