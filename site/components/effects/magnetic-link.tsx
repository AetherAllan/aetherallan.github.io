"use client"

import { ArrowUpRight } from "lucide-react"
import { useRef } from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

export function MagneticLink({
  href,
  children,
  variant = "primary",
}: {
  href: string
  children: React.ReactNode
  variant?: "primary" | "ghost"
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  function onMove(event: React.MouseEvent<HTMLAnchorElement>) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    gsap.to(ref.current, { x: x * 0.18, y: y * 0.28, duration: 0.35, ease: "power3.out" })
  }

  function onLeave() {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.35)" })
  }

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
        variant === "primary"
          ? "bg-cyan-200 text-zinc-950 hover:bg-cyan-100"
          : "border border-white/10 bg-white/[0.03] text-zinc-100 hover:bg-white/[0.08]",
      )}
    >
      {children}
      <ArrowUpRight size={16} />
    </a>
  )
}
