import { FileWindowSystem } from "@/components/file-window-system"
import { Nav } from "@/components/nav"
export default function HowItMadePage() {
  return (
    <>
      <Nav />
      <main id="main" className="archive-page">
        <div className="archive-heading">
          <div>
            <p className="screen-eyebrow">COLOPHON / DESIGN & ENGINEERING</p>
            <h1>Behind the interface.</h1>
          </div>
          <a href="/" className="text-link">
            Back to index ↗
          </a>
        </div>
        <p className="archive-description">
          A few notes on the design, the light, and the things underneath.
        </p>
        <FileWindowSystem />
      </main>
    </>
  )
}
