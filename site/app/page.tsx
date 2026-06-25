import { GsapProvider } from "@/components/effects/gsap-provider"
import { Nav } from "@/components/nav"
import { NoirHome } from "@/components/noir-home"

export default function Home() {
  return (
    <>
      <GsapProvider />
      <Nav />
      <main>
        <NoirHome />
      </main>
    </>
  )
}
