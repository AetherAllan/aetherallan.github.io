"use client"
import { X, ArrowUpRight } from "lucide-react"
import { useEffect, useRef } from "react"

type ContactModalProps = { className?: string; children?: React.ReactNode }
export function ContactModal({ className, children = "Get in touch" }: ContactModalProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("signal-noir:contact-open"))}
      className={className}
    >
      {children}
    </button>
  )
}
export function GlobalContactWindow() {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    // Native modal behavior provides Escape, focus containment and focus restoration.
    const open = () => {
      if (!dialog.current?.open) dialog.current?.showModal()
    }
    window.addEventListener("signal-noir:contact-open", open)
    return () => window.removeEventListener("signal-noir:contact-open", open)
  }, [])
  return (
    <dialog
      ref={dialog}
      className="contact-dialog"
      aria-labelledby="contact-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close()
      }}
    >
      <div className="contact-dialog-content">
        <button
          className="dialog-close"
          aria-label="Close contact window"
          onClick={() => dialog.current?.close()}
        >
          <X size={18} />
        </button>
        <p className="eyebrow">CONTACT</p>
        <h2 id="contact-title">Let’s make something.</h2>
        <p>Have a project or an idea in mind?</p>
        <a href="mailto:aetherallan@gmail.com">
          aetherallan@gmail.com <ArrowUpRight size={16} />
        </a>
      </div>
    </dialog>
  )
}
