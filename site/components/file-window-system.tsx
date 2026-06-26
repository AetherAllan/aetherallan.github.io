"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Draggable } from "gsap/Draggable"
import { FileCode2, FileText, X } from "lucide-react"
import type { MouseEvent } from "react"
import { useRef, useState } from "react"

gsap.registerPlugin(Draggable)

const files = {
  "README.MD": [
    "Signal Noir v3 is a static portfolio shell around an existing Quartz knowledge base.",
    "The visual language is CRT, grayscale, terminal desktop, sculptural wireframe, and scroll-driven typography.",
  ],
  "STACK.JSON": [
    "{",
    '  "frontend": ["Next.js static export", "React", "Tailwind v4"],',
    '  "animation": ["GSAP", "ScrollTrigger", "SplitText", "Flip", "Draggable"],',
    '  "scene": ["Three.js", "@react-three/fiber", "custom shader"],',
    '  "notes": "Quartz mounted under /notes/"',
    "}",
  ],
  "SIGNAL_3D.SCENE": [
    "A procedural LatheGeometry creates the sculpture silhouette.",
    "A custom shader handles rim light, scan bands, x-ray transparency, and click ripple displacement.",
    "The object stays smaller than v2 so typography and scroll rhythm carry the page.",
  ],
  "INTERACTIVE.JS": [
    "SplitText reveals hero typography.",
    "ScrambleText gives system labels a boot sequence.",
    "ScrollTrigger pins narrative and project sections.",
    "Flip animates window open/close. Draggable makes windows movable.",
  ],
  "DEV_LOG.TXT": [
    "Quartz core is intentionally untouched to reduce upstream merge conflicts.",
    "The site stays static for GitHub Pages: no API routes, no database, no runtime form handler.",
    "The v3 pass favors human rhythm over one oversized 3D object.",
  ],
}

type FileName = keyof typeof files

const windowPositions: Record<FileName, { x: number; y: number }> = {
  "README.MD": { x: 0, y: 0 },
  "STACK.JSON": { x: 8, y: 30 },
  "SIGNAL_3D.SCENE": { x: 16, y: 60 },
  "INTERACTIVE.JS": { x: 24, y: 90 },
  "DEV_LOG.TXT": { x: 32, y: 120 },
}

export function FileWindowSystem() {
  const rootRef = useRef<HTMLDivElement>(null)
  const names = Object.keys(files) as FileName[]
  const [open, setOpen] = useState<FileName[]>(["README.MD"])
  const [focused, setFocused] = useState<FileName>("README.MD")

  useGSAP(
    () => {
      Draggable.create("[data-window]", {
        trigger: "[data-window-bar]",
        bounds: rootRef.current,
        edgeResistance: 0.8,
      })
    },
    { scope: rootRef, dependencies: [open], revertOnUpdate: true },
  )

  function openFile(name: FileName) {
    setOpen((current) => (current.includes(name) ? current : [...current, name]))
    setFocused(name)
  }

  function closeFile(name: FileName) {
    setOpen((current) => current.filter((item) => item !== name))
    if (focused === name) setFocused(open.find((item) => item !== name) ?? "README.MD")
  }

  function animateIcon(event: MouseEvent<HTMLButtonElement>, active: boolean) {
    const target = event.currentTarget
    gsap.to(target, {
      y: active ? -7 : 0,
      backgroundColor: active ? "rgba(39,39,42,0.96)" : "rgba(9,9,11,0.8)",
      borderColor: active ? "rgba(244,244,245,0.52)" : "rgba(255,255,255,0.12)",
      duration: 0.22,
      ease: "power2.out",
    })
    gsap.to(target.querySelector("svg"), {
      rotate: active ? -5 : 0,
      scale: active ? 1.12 : 1,
      duration: 0.22,
      ease: "power2.out",
    })
  }

  function pressIcon(event: MouseEvent<HTMLButtonElement>, name: FileName) {
    const target = event.currentTarget
    gsap.fromTo(target, { scale: 0.96 }, { scale: 1, duration: 0.24, ease: "back.out(2.2)" })
    openFile(name)
  }

  return (
    <div ref={rootRef} className="relative min-h-[700px] overflow-hidden border border-white/[0.1] bg-black/45 p-4" style={{ overflowAnchor: "none" }}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {names.map((name) => (
          <button
            key={name}
            data-file-icon
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={(event) => animateIcon(event, true)}
            onMouseLeave={(event) => animateIcon(event, false)}
            onClick={(event) => pressIcon(event, name)}
            className="group flex min-h-28 flex-col items-center justify-center gap-3 border border-white/[0.12] bg-zinc-950/80 p-4 text-center text-xs font-bold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            {name.endsWith(".MD") || name.endsWith(".TXT") ? (
              <FileText className="size-9 text-zinc-500 group-hover:text-zinc-100" />
            ) : (
              <FileCode2 className="size-9 text-zinc-500 group-hover:text-zinc-100" />
            )}
            {name}
          </button>
        ))}
      </div>

      {open.map((name) => (
        <section
          key={name}
          data-window
          className="noir-panel absolute left-4 right-4 top-48 min-h-72 overflow-hidden sm:left-auto sm:right-auto sm:w-[540px]"
          style={{
            transform: `translate(${windowPositions[name].x}px, ${windowPositions[name].y}px)`,
            zIndex: focused === name ? 40 : 20 + names.indexOf(name),
          }}
          onMouseDown={() => setFocused(name)}
        >
          <header data-window-bar className="flex h-10 cursor-move items-center justify-between border-b border-white/[0.12] bg-zinc-100 px-3 text-black">
            <span className="text-xs font-black">{name}</span>
            <button
              type="button"
              aria-label={`Close ${name}`}
              onClick={(event) => {
                event.stopPropagation()
                closeFile(name)
              }}
              className="grid size-6 cursor-pointer place-items-center border border-black/30 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </header>
          <div className="space-y-3 p-5 text-sm leading-7 text-zinc-300">
            {files[name].map((line) => (
              <p key={line} className="whitespace-pre-wrap">
                {line}
              </p>
            ))}
          </div>
        </section>
      ))}

      <div className="absolute bottom-0 left-0 right-0 flex gap-2 overflow-x-auto border-t border-white/[0.12] bg-black p-2">
        {open.map((name) => (
          <button
            key={name}
            data-task
            type="button"
            onClick={() => setFocused(name)}
            className={`border px-3 py-2 text-[11px] font-bold ${
              focused === name ? "border-zinc-100 bg-zinc-100 text-black" : "border-white/[0.12] text-zinc-400"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
