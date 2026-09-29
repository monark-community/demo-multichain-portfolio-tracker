"use client"

import { InfoIcon } from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** Context on demand: an info icon whose tooltip holds the explanation. */
export function InfoTip({ label, className }: { label: string; className?: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground", className)}
            onClick={(e) => e.preventDefault()}
          >
            <InfoIcon className="size-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-60 text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
