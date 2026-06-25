"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export function RevealText({
  children,
  className,
  delay = 0,
}: {
  children: string
  className?: string
  delay?: number
}) {
  const root = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduceMotion || !root.current) return

      gsap.from(root.current.querySelectorAll("[data-word]"), {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        delay,
        ease: "power4.out",
        stagger: 0.035,
      })
    },
    { scope: root },
  )

  return (
    <span ref={root} className={cn("inline-block overflow-hidden", className)}>
      {children.split(" ").map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden align-bottom">
          <span data-word className="inline-block pr-[0.28em]">
            {word}
          </span>
        </span>
      ))}
    </span>
  )
}
