"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Mail, X } from "lucide-react"
import { useRef, useState } from "react"

type ContactModalProps = {
  className?: string
  children?: React.ReactNode
}

export function ContactModal({ className, children = "INQUIRE NOW" }: ContactModalProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!open) return
      gsap.fromTo("[data-contact-window]", { y: 28, scale: 0.96, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.36, ease: "power3.out" })
    },
    { scope: rootRef, dependencies: [open] },
  )

  return (
    <div ref={rootRef} className="contents">
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <section
            data-contact-window
            className="noir-panel w-full max-w-sm overflow-hidden bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex h-10 items-center justify-between border-b border-white/[0.12] bg-zinc-100 px-3 text-black">
              <span className="font-mono text-xs font-black">CONTACT.INFO</span>
              <button type="button" aria-label="Close contact window" onClick={() => setOpen(false)} className="grid size-6 place-items-center border border-black/30">
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
        </div>
      ) : null}
    </div>
  )
}
