"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { selectedWork } from "@/lib/profile"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function SelectedWork() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduceMotion || !root.current) return

      const cards = gsap.utils.toArray<HTMLElement>("[data-work-card]")
      cards.forEach((card, index) => {
        gsap.to(card, {
          y: index % 2 === 0 ? -24 : 24,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="work" ref={root} className="overflow-hidden px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Selected Work</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-zinc-100 sm:text-6xl">
          Projects shaped by systems, security, and story.
        </h2>
      </div>
      <div className="mx-auto mt-14 grid max-w-7xl gap-5 md:grid-cols-2">
        {selectedWork.map((work, index) => (
          <article
            data-work-card
            key={work.title}
            className="glass min-h-[24rem] rounded-[1.5rem] p-7 will-change-transform"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-zinc-500">
              <span>{work.type}</span>
              <span>{work.year}</span>
            </div>
            <div className="mt-28 text-cyan-200/70">0{index + 1}</div>
            <h3 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-zinc-50">
              {work.title}
            </h3>
            <p className="mt-6 max-w-md text-lg leading-8 text-zinc-400">{work.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
