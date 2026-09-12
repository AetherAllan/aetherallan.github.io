export function FileWindowSystem() {
  return (
    <div className="colophon-grid">
      <section>
        <p className="eyebrow">01 / INTERFACE</p>
        <h2>Less, with intention.</h2>
        <p>
          Geist and Geist Mono. Black, white and generous space. A small amount of retrofuturism,
          expressed through light rather than decoration.
        </p>
      </section>
      <section>
        <p className="eyebrow">02 / LIGHT</p>
        <h2>A full spectrum.</h2>
        <p>
          The prism is rendered with vgpu and WebGPU, using Vercel’s open-source dark prism scene.
          Move your pointer to change the light. A rendered still is used when WebGPU is
          unavailable.
        </p>
        <a className="text-link" href="https://github.com/vercel-labs/vgpu">
          vgpu source & MIT license ↗
        </a>
      </section>
      <section>
        <p className="eyebrow">03 / ENGINEERING</p>
        <h2>Built for the web.</h2>
        <p>
          Next.js, React and a static export. GSAP connects the prism to a vgpu FFT ocean as you
          scroll. The prism updates only on interaction or resize; pointer motion is disabled
          offscreen, in hidden tabs, and with reduced motion.
        </p>
      </section>
      <section>
        <p className="eyebrow">04 / NOTES</p>
        <h2>A place for thinking.</h2>
        <p>
          The notes live in a separate Quartz knowledge base. Their content, reading layout and URLs
          remain independent of the portfolio.
        </p>
        <a className="text-link" href="/notes/">
          Explore the notes ↗
        </a>
      </section>
    </div>
  )
}
