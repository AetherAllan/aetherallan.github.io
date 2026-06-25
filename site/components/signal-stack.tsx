import { focusAreas } from "@/lib/profile"

export function SignalStack() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Focus</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-100 sm:text-5xl">
            Four signals, one practice.
          </h2>
        </div>
      </div>
      <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.08] md:grid-cols-2">
        {focusAreas.map((area, index) => (
          <article key={area.title} className="group bg-[#0d1014] p-7 transition hover:bg-[#11161c]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-zinc-500">
              <span>{area.kicker}</span>
              <span>0{index + 1}</span>
            </div>
            <h3 className="mt-12 text-3xl font-semibold tracking-[-0.04em] text-zinc-100">
              {area.title}
            </h3>
            <p className="mt-4 max-w-md leading-7 text-zinc-400">{area.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
