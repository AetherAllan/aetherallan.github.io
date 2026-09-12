"use client"
import { usePathname } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { ContactModal } from "./contact-modal"

export function Nav() {
  const pathname = usePathname()
  return (
    <header className={`site-header${pathname === "/" ? " site-header-home" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <a className="wordmark" href="/">
        aetherallan<span>_</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/#work">Work</a>
        <a href="/#about">About</a>
        <a href="/notes/">
          Notes <ArrowUpRight size={12} />
        </a>
      </nav>
      <ContactModal className="header-contact">
        Get in touch <ArrowUpRight size={14} />
      </ContactModal>
    </header>
  )
}
