"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { ArrowUpRight, Mail } from "lucide-react"
import { useEffect, useRef } from "react"
import { latestNotes, selectedWork } from "@/lib/profile"
import { ContactModal } from "./contact-modal"
import { SignalCore } from "./signal-core"

gsap.registerPlugin(ScrollTrigger, SplitText)

const nodes = ["Software", "AI", "Web3", "Games", "Security", "Notes"]

function PulseField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const canvasEl = canvas
    const ctx = canvasEl.getContext("2d")
    if (!ctx) return
    const context = ctx
    let frame = 0
    let raf = 0

    function resize() {
      canvasEl.width = canvasEl.clientWidth * window.devicePixelRatio
      canvasEl.height = canvasEl.clientHeight * window.devicePixelRatio
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
    }

    function draw() {
      frame += 0.012
      const { clientWidth: w, clientHeight: h } = canvasEl
      context.clearRect(0, 0, w, h)
      context.strokeStyle = "rgba(244,244,241,.12)"
      context.lineWidth = 1
      for (let x = 0; x < w; x += 38) {
        const offset = Math.sin(frame + x * 0.012) * 10
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x + offset, h)
        context.stroke()
      }
      for (let y = 0; y < h; y += 38) {
        const offset = Math.cos(frame + y * 0.012) * 10
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(w, y + offset)
        context.stroke()
      }
      const r = 90 + Math.sin(frame * 2) * 28
      context.strokeStyle = "rgba(244,244,241,.18)"
      context.beginPath()
      context.arc(w * 0.72, h * 0.38, r, 0, Math.PI * 2)
      context.stroke()
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" aria-hidden="true" />
}

export function NoirHome() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          desktop: "(min-width: 900px)",
          mobile: "(max-width: 899px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, mobile, reduce } = context.conditions ?? {}
          if (reduce) {
            gsap.set("[data-reveal]", { autoAlpha: 1 })
            return
          }

          const split = SplitText.create("[data-title]", { type: "words,chars", aria: "auto" })
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } })
          intro
            .from(split.chars, { yPercent: 110, rotation: 4, autoAlpha: 0, stagger: 0.015, duration: 0.7 })
            .from("[data-reveal]", { y: 22, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, "<0.15")

          gsap.to("[data-hero-sculpture]", {
            y: -22,
            rotate: -1.5,
            scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: 1 },
          })

          if (mobile) {
            gsap.to("[data-hero-sculpture]", {
              y: -12,
              rotate: 1.2,
              duration: 2.8,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            })
            gsap.from("[data-about-line], [data-node], [data-note], [data-work-card]", {
              y: 24,
              opacity: 0.92,
              stagger: 0.05,
              scrollTrigger: { trigger: "[data-about]", start: "top 88%" },
            })
          }

          if (desktop) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: "[data-about]",
                  start: "top top",
                  end: "+=1400",
                  scrub: 1,
                  pin: true,
                },
              })
              .from("[data-about-word]", { yPercent: 90, autoAlpha: 0, stagger: 0.08 })
              .to("[data-about-orb]", { scale: 1.8, xPercent: 34, rotation: 28 }, "<")
              .from("[data-about-line]", { x: -60, autoAlpha: 0, stagger: 0.12 }, "<0.1")
          }

          gsap.from("[data-node]", {
            scale: 0.2,
            autoAlpha: 0,
            stagger: { each: 0.07, from: "center" },
            ease: "back.out(1.8)",
            scrollTrigger: { trigger: "[data-stack-web]", start: "top 70%" },
          })

          if (desktop) {
            gsap.to("[data-work-track]", {
              xPercent: -48,
              ease: "none",
              scrollTrigger: { trigger: "[data-work]", start: "top top", end: "+=1800", scrub: 1, pin: true },
            })
          } else {
            gsap.from("[data-work-card]", {
              y: 50,
              autoAlpha: 0,
              stagger: 0.08,
              scrollTrigger: { trigger: "[data-work]", start: "top 75%" },
            })
          }

          gsap.from("[data-note]", {
            y: 28,
            autoAlpha: 0,
            stagger: 0.08,
            scrollTrigger: { trigger: "[data-notes]", start: "top 78%" },
          })
          gsap.from("[data-line]", {
            scaleX: 0,
            transformOrigin: "left",
            scrollTrigger: { trigger: "[data-contact]", start: "top 78%" },
          })
        },
      )

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} className="overflow-hidden">
      <div className="boot-mask fixed inset-0 z-[90] grid place-items-center bg-black px-8 text-zinc-100">
        <div className="w-full max-w-sm">
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] font-semibold text-zinc-500">
            <span>100%</span>
          </div>
          <div className="h-px overflow-hidden bg-white/[0.14]">
            <div className="boot-progress h-full origin-left bg-zinc-100" />
          </div>
        </div>
      </div>

      <section data-hero className="wire-room relative min-h-screen overflow-hidden px-4 pt-24 sm:px-6">
        <PulseField />
        <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.82fr]">
          <div className="relative z-10">
            <p data-reveal className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
              Portfolio / Notes / Work
            </p>
            <h1 data-title className="scan-title max-w-4xl overflow-hidden text-6xl font-black leading-none text-zinc-100 sm:text-8xl lg:text-9xl">
              AETHER ALLAN
            </h1>
            <div className="mt-8 max-w-2xl">
              <p data-reveal className="text-base leading-8 text-zinc-300 sm:text-lg">
                I build product software across AI, Web3, games, and security writing. My best work sits between clear product judgment, careful engineering, and notes that make hard ideas easier to discuss.
              </p>
            </div>
            <div data-reveal className="mt-8 flex flex-wrap gap-3">
              <ContactModal
                className="inline-flex items-center gap-2 border border-zinc-100 bg-zinc-100 px-5 py-3 text-xs font-black text-black transition hover:bg-zinc-300 hover:text-black"
              >
                <Mail className="size-4" />
                INQUIRE NOW
              </ContactModal>
              <a
                href="/notes/"
                className="inline-flex items-center gap-2 border border-white/[0.14] px-5 py-3 text-xs font-black text-zinc-100 transition hover:bg-white/[0.08]"
              >
                NOTES <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>

          <div
            data-reveal
            data-hero-sculpture
            className="noir-panel relative z-10 mx-auto h-[390px] w-full max-w-[440px] overflow-hidden bg-black/55 sm:h-[500px]"
          >
            <div className="absolute inset-0 opacity-45 [background:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:30px_30px]" />
            <SignalCore />
            <div className="absolute bottom-4 left-4 text-[11px] text-zinc-500">CLICK / X-RAY RIPPLE</div>
          </div>
        </div>
      </section>

      <section data-about className="relative overflow-hidden border-y border-white/[0.08] px-4 py-14 sm:px-6 md:grid md:min-h-screen md:place-items-center md:py-24">
        <div data-about-orb className="absolute left-[8%] top-[14%] size-48 rounded-full border border-white/[0.16] bg-white/[0.04]" />
        <div className="mx-auto max-w-7xl">
          <div className="overflow-visible text-5xl font-black leading-none text-zinc-100 sm:text-9xl md:overflow-hidden">
            {["WHAT", "ABOUT"].map((word) => (
              <div key={word} data-about-word>
                {word}
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 text-lg leading-8 text-zinc-300 md:grid-cols-3">
            {[
              "I prefer building things that can be explained clearly and inspected calmly.",
              "I care about product feel, technical depth, and the discipline to keep both readable.",
              "I am looking for work where prototypes, systems thinking, and written reasoning all matter.",
            ].map((line) => (
              <p key={line} data-about-line className="border-t border-white/[0.14] pt-4">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section data-stack-web className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs font-bold text-zinc-500">TELL / ME</p>
          <h2 className="mt-4 text-4xl font-black text-zinc-100 sm:text-6xl">Signal stack</h2>
          <p className="mt-5 max-w-md leading-7 text-zinc-400">
            Short labels only. I would rather show judgment through focused work than turn this into a dense checklist.
          </p>
        </div>
        <div className="noir-panel relative min-h-[440px] overflow-hidden p-6">
          <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 600 440" aria-hidden="true">
            <path d="M300 36 542 154 482 390 118 390 58 154Z" fill="none" stroke="rgba(244,244,241,.18)" />
            <path d="M300 88 488 180 442 342 158 342 112 180Z" fill="none" stroke="rgba(244,244,241,.13)" />
            <path d="M300 36v354M58 154l424 236M542 154 118 390" stroke="rgba(244,244,241,.12)" />
          </svg>
          {nodes.map((node, index) => {
            const points = [
              "left-[48%] top-[7%]",
              "right-[6%] top-[32%]",
              "right-[16%] bottom-[10%]",
              "left-[18%] bottom-[10%]",
              "left-[6%] top-[32%]",
              "left-[43%] top-[46%]",
            ]
            return (
              <div key={node} data-node className={`absolute ${points[index]} border border-white/[0.14] bg-black px-4 py-3 text-xs font-bold text-zinc-100 shadow-2xl`}>
                {node}
              </div>
            )
          })}
        </div>
      </section>

      <section data-work id="work" className="overflow-hidden px-4 py-20 sm:px-6 md:min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="text-5xl font-black text-zinc-100 sm:text-8xl">SELECTED WORK</h2>
            <a href="/stack/" className="hidden text-xs font-bold text-zinc-400 hover:text-white sm:block">
              OPEN STACK →
            </a>
          </div>
          <div data-work-track className="grid gap-4 md:flex md:w-max md:gap-6">
            {selectedWork.map((work, index) => (
              <article
                key={work.title}
                data-work-card
                className="noir-panel group min-h-[300px] w-full p-5 transition hover:-translate-y-2 hover:bg-zinc-950 md:h-[360px] md:w-[460px]"
              >
                <div className="mb-16 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{work.year} / {work.type}</span>
                </div>
                <h3 className="text-3xl font-black text-zinc-100">{work.title}</h3>
                <p className="mt-5 text-sm leading-7 text-zinc-400">{work.body}</p>
                <div className="mt-10 h-px origin-left bg-zinc-100/60 transition duration-500 group-hover:scale-x-75" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-notes className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-4xl font-black text-zinc-100 sm:text-6xl">NOTES GATE</h2>
          <a href="/notes/" className="text-xs font-bold text-zinc-400 hover:text-white">OPEN VAULT →</a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {latestNotes.map((note) => (
            <a key={note.href} data-note href={note.href} className="border-t border-white/[0.14] py-5 text-zinc-300 hover:text-white">
              <span className="text-[11px] text-zinc-500">{note.tag}</span>
              <p className="mt-2 text-lg font-bold">{note.title}</p>
            </a>
          ))}
        </div>
      </section>

      <section data-contact className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div data-line className="mb-8 h-px bg-zinc-100" />
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <h2 className="max-w-3xl text-5xl font-black leading-none text-zinc-100 sm:text-8xl">GET IN TOUCH</h2>
          <ContactModal
            className="inline-flex w-fit items-center gap-2 border border-zinc-100 bg-zinc-100 px-5 py-3 text-xs font-black text-black transition hover:bg-zinc-300 hover:text-black"
          >
            INQUIRE NOW <ArrowUpRight className="size-4" />
          </ContactModal>
        </div>
      </section>
    </div>
  )
}
