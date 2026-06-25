import * as React from "react"
import { cn } from "@/lib/utils"

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100",
        className,
      )}
      {...props}
    />
  )
}
