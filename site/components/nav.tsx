import { Github, Mail } from "lucide-react"
import { ContactModal } from "./contact-modal"

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "STACK", href: "/stack/" },
  { label: "HOW IT'S MADE", href: "/how-it-made/" },
  { label: "NOTES", href: "/notes/" },
]

export function Nav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-black/70 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 md:flex-nowrap">
        <a href="/" className="text-sm font-bold text-zinc-100">
          AETHER<span className="text-zinc-500">_</span>ALLAN
        </a>
        <div className="order-last flex w-full items-center justify-center gap-4 overflow-x-auto text-[11px] text-zinc-400 md:order-none md:w-auto md:gap-5">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-zinc-50">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/AetherAllan"
            aria-label="GitHub"
            className="grid size-9 place-items-center border border-white/[0.12] bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
          >
            <Github className="size-4" />
          </a>
          <ContactModal
            className="hidden items-center gap-2 border border-zinc-100 bg-zinc-100 px-3 py-2 text-[11px] font-bold text-black transition hover:bg-zinc-300 hover:text-black sm:flex"
          >
            <Mail className="size-3.5" />
            INQUIRE NOW
          </ContactModal>
        </div>
      </nav>
    </header>
  )
}
