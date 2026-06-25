"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion || !ref.current) return

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max <= 0 ? 0 : window.scrollY / max
      gsap.to(ref.current, { scaleX: progress, duration: 0.2, ease: "power2.out" })
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <div className="fixed left-0 top-0 z-50 h-px w-full origin-left scale-x-0 bg-cyan-200" ref={ref} />
  )
}
