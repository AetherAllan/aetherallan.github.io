import { Nav } from "@/components/nav"
import { StackTerminal } from "@/components/stack-terminal"

export default function StackPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-3 pt-20 sm:px-6 sm:pt-24">
        <section className="mx-auto max-w-5xl">
          <StackTerminal />
        </section>
      </main>
    </>
  )
}
