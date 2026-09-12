"use client"
import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { OceanArt } from "./ocean-art"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { profile, selectedWork } from "@/lib/profile"
import { ContactModal } from "./contact-modal"
import { TransmissionArt } from "./transmission-art"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function NoirHome() {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          gsap
            .timeline({
              scrollTrigger: { trigger: "#work", start: "top bottom", end: "top 15%", scrub: 0.8 },
            })
            .to(".hero-copy", { y: -65, opacity: 0, ease: "none" }, 0)
            .to(".prism-art", { y: 90, opacity: 0, ease: "none" }, 0)
            .from(".ocean-art", { y: 100, opacity: 0.05, ease: "none" }, 0)
          gsap.from(".work-entry", {
            y: 32,
            opacity: 0,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: { trigger: ".work-grid", start: "top 95%", end: "top 55%", scrub: 0.6 },
          })
        },
        root,
      )
      return () => media.revert()
    },
    { scope: root },
  )
  return (
    <div ref={root}>
      <section className="prism-hero" aria-label="Introduction">
        <TransmissionArt />
        <div className="hero-copy">
          <h1>AetherAllan.</h1>
          <p className="hero-statement">
            Software, systems,
            <br />
            and a little curiosity.
          </p>
          <p className="hero-description">
            Exploring the space between human and machine.
            <br />
            Building across AI, Web3, games, and security.
          </p>
          <div className="hero-actions">
            <a href="#work" className="button-primary">
              Selected work <ArrowDown size={14} />
            </a>
            <a href="https://github.com/AetherAllan" className="button-secondary">
              GitHub <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="prism-slot" aria-hidden="true" />
      </section>
      <section id="work" className="work-section">
        <OceanArt />
        <div className="work-content content-width">
          <div className="section-heading">
            <div>
              <h2>Selected work</h2>
            </div>
            <a href="https://github.com/AetherAllan" className="text-link">
              All repositories <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="work-grid">
            {selectedWork.map((work) => (
              <article key={work.title} className="work-entry">
                <h3>{work.title}</h3>
                <p>{work.body}</p>
                <span className="work-type">{work.type}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="about" className="about-section content-width">
        <div>
          <h2>About</h2>
        </div>
        <div className="about-copy">
          <p>{profile.intro}</p>
          <p>{profile.summary}</p>
          <div className="about-links">
            <a href="/notes/" className="text-link">
              Read my notes <ArrowUpRight size={14} />
            </a>
            <ContactModal className="text-link">
              Let’s talk <ArrowUpRight size={14} />
            </ContactModal>
          </div>
        </div>
      </section>
      <footer className="site-footer content-width">
        <span>© {new Date().getFullYear()} AetherAllan</span>
        <a href="/how-it-made/">Colophon</a>
      </footer>
    </div>
  )
}
