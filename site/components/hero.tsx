import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { MagneticLink } from "@/components/effects/magnetic-link"
import { RevealText } from "@/components/effects/reveal-text"
import { profile } from "@/lib/profile"

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-5 pt-24 sm:px-8">
      <div className="signal-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="max-w-4xl">
          <Badge>Signal Noir / Portfolio</Badge>
          <h1 className="mt-8 max-w-5xl text-balance text-6xl font-semibold leading-[0.92] tracking-[-0.05em] text-zinc-50 sm:text-7xl lg:text-8xl">
            <RevealText>{profile.name}</RevealText>
          </h1>
          <p className="mt-8 max-w-2xl text-balance text-xl leading-8 text-zinc-300 sm:text-2xl">
            {profile.intro}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500">{profile.summary}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <MagneticLink href="/notes/">Read Notes</MagneticLink>
            <MagneticLink href="#work" variant="ghost">
              View Work
            </MagneticLink>
          </div>
        </div>

        <div className="glass relative mx-auto aspect-square w-full max-w-[26rem] overflow-hidden rounded-[2rem] p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(125,211,252,0.24),transparent_34%)]" />
          <Image
            src={profile.avatar}
            width={420}
            height={420}
            priority
            alt="AetherAllan avatar"
            className="relative h-full w-full rounded-[1.4rem] object-cover grayscale-[0.15]"
          />
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-full border border-white/10 bg-black/35 px-4 py-3 text-xs uppercase tracking-[0.2em] text-cyan-100 backdrop-blur-md">
            <span>Available signal</span>
            <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(163,230,53,0.9)]" />
          </div>
        </div>
      </div>
    </section>
  )
}
