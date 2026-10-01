"use client"

import { FlaskConicalIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useDict } from "@/i18n/provider"
import type { DemoControls } from "@/lib/demo"
import { resetDemo, setControl, useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

export function DemoControlsButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { d } = useDict()
  const demo = useDemo()
  const armed = demo.controls.failNextRead || demo.controls.failNextExport || demo.controls.slow
  const rows: { key: keyof DemoControls; title: string; body: string }[] = [
    { key: "failNextRead", title: d.controls.failRead, body: d.controls.failReadBody },
    { key: "failNextExport", title: d.controls.failExport, body: d.controls.failExportBody },
    { key: "slow", title: d.controls.slow, body: d.controls.slowBody },
  ]
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "icon" : "default"}
          aria-label={compact ? d.controls.open : undefined}
          className={cn("relative", !compact && "justify-start", className)}
        >
          <FlaskConicalIcon aria-hidden="true" />
          {!compact && d.controls.open}
          {armed && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" aria-label={d.controls.armed} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={d.common.close} className="max-w-[calc(100%-2rem)] rounded-xl sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-extrabold tracking-tight">{d.controls.title}</DialogTitle>
          <DialogDescription>{d.controls.body}</DialogDescription>
        </DialogHeader>
        <ul className="divide-y rounded-lg border">
          {rows.map((r) => (
            <li key={r.key} className="flex items-start justify-between gap-4 px-4 py-3">
              <label htmlFor={`ctl-${r.key}`} className="min-w-0 cursor-pointer">
                <span className="block text-sm font-semibold">{r.title}</span>
                <span className="block text-sm text-muted-foreground">{r.body}</span>
              </label>
              <Switch
                id={`ctl-${r.key}`}
                checked={demo.controls[r.key]}
                onCheckedChange={(v) => setControl(r.key, v)}
                className="mt-0.5"
              />
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4">
          <p className="text-sm text-muted-foreground">{d.controls.resetBody}</p>
          <Button
            variant="outline"
            className="self-start"
            onClick={() => {
              resetDemo()
              toast(d.controls.resetDone)
            }}
          >
            <RotateCcwIcon aria-hidden="true" />
            {d.controls.reset}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
