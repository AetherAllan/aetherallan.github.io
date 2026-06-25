import { ArrowRight } from "lucide-react"
import { latestNotes } from "@/lib/profile"

export function NotesGateway() {
  return (
    <section id="notes" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Notes</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-zinc-100 sm:text-6xl">
            The garden stays alive.
          </h2>
          <p className="mt-6 max-w-md leading-7 text-zinc-400">
            Obsidian notes remain powered by Quartz: backlinks, tags, graph view, search, and long-form
            technical writing all live under one quiet entrance.
          </p>
          <a
            href="/notes/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-100"
          >
            Enter notes <ArrowRight size={16} />
          </a>
        </div>
        <div className="divide-y divide-white/10 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03]">
          {latestNotes.map((note) => (
            <a
              key={note.href}
              href={note.href}
              className="group flex items-center justify-between gap-5 p-6 transition hover:bg-white/[0.04]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{note.tag}</p>
                <h3 className="mt-2 text-xl font-medium tracking-[-0.02em] text-zinc-100">
                  {note.title}
                </h3>
              </div>
              <ArrowRight className="shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
