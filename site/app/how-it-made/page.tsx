import { FileWindowSystem } from "@/components/file-window-system"
import { Nav } from "@/components/nav"

export default function HowItMadePage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-4 pt-24 sm:px-6">
        <section className="mx-auto max-w-7xl">
          <p className="text-xs font-bold text-zinc-500">SYS_INFO_ / BUILD LOG</p>
          <h1 className="mt-4 text-5xl font-black text-zinc-100 sm:text-8xl">HOW IT&apos;S MADE</h1>
          <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
            Accessing public build notes. Click icons to open the implementation files behind this static portfolio.
          </p>
          <div className="mt-10">
            <FileWindowSystem />
          </div>
        </section>
      </main>
    </>
  )
}
