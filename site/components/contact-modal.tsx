"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type ContactModalProps = {
  className?: string
  children?: React.ReactNode
}

export function ContactModal({ className, children = "INQUIRE NOW" }: ContactModalProps) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("signal-noir:contact-open"))} className={className}>
      {children}
    </button>
  )
}

export function GlobalContactWindow() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [openCount, setOpenCount] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function openContact() {
      setClosing(false)
      setOpen(true)
      setOpenCount((count) => count + 1)
    }

    window.addEventListener("signal-noir:contact-open", openContact)
    return () => window.removeEventListener("signal-noir:contact-open", openContact)
  }, [])

  useGSAP(
    () => {
      if (!open || closing) return
      gsap.fromTo(
        "[data-contact-window]",
        { y: 24, x: 16, scale: 0.94, autoAlpha: 0 },
        { y: 0, x: 0, scale: 1, autoAlpha: 1, duration: 0.34, ease: "power3.out" },
      )
    },
    { scope: rootRef, dependencies: [open, closing, openCount] },
  )

  useGSAP(
    () => {
      if (!closing) return
      const windowEl = rootRef.current?.querySelector("[data-contact-window]")
      if (!windowEl) {
        setOpen(false)
        setClosing(false)
        return
      }
      gsap.to(windowEl, {
        y: 18,
        x: 10,
        scale: 0.96,
        autoAlpha: 0,
        duration: 0.18,
        ease: "power2.in",
        onComplete: () => {
          setOpen(false)
          setClosing(false)
        },
      })
    },
    { scope: rootRef, dependencies: [closing] },
  )

  function closeContact() {
    const windowEl = rootRef.current?.querySelector("[data-contact-window]")
    if (!windowEl) {
      setOpen(false)
      setClosing(false)
      return
    }
    setClosing(true)
  }

  return (
    <div ref={rootRef}>
      {open ? (
        <section
          data-contact-window
          className="noir-panel fixed bottom-4 left-4 right-4 z-[100] overflow-hidden bg-black shadow-2xl sm:left-auto sm:w-[360px]"
        >
          <header className="flex h-10 items-center justify-between border-b border-white/[0.12] bg-zinc-100 px-3 text-black">
            <span className="font-mono text-xs font-black">CONTACT.INFO</span>
            <button
              type="button"
              aria-label="Close contact window"
              onClick={closeContact}
              className="grid size-6 place-items-center border border-black/30 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </header>
          <div className="flex items-center gap-4 p-5">
            <img src="/avatar.png" alt="AetherAllan avatar" className="size-20 border border-white/[0.14] object-cover" />
            <div>
              <p className="text-sm font-black text-zinc-100">AetherAllan</p>
              <p className="mt-2 font-mono text-sm text-zinc-300">aetherallan@gmail.com</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
