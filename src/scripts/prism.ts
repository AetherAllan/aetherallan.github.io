// Live WebGPU prism for the homepage hero, using the vendored vgpu scene.
//
// The page owns everything around the renderer: when frames are drawn, input,
// resize, visibility and the static fallback. Frames are only submitted during
// the intro, while the light is moving towards the pointer, and on resize; an
// idle page submits nothing. Any GPU error or device loss hands the hero back to
// the pre-rendered image in public/art/.

type Renderer = "pending" | "vgpu" | "static"

// How far the pointer can swing the lamp (arc, target) and the camera orbit.
// Both are normalised scene controls; 0.5 is the composed resting frame.
const LAMP_RANGE = 0.05
const ORBIT_RANGE = 0.22
const EASE = 0.14
const SETTLE_EPSILON = 0.0004
// If the GPU path hasn't produced a frame by then, show the still image.
const PENDING_TIMEOUT_MS = 3500

export function mountPrism(hero: HTMLElement): void {
  const art = hero.querySelector<HTMLElement>(".prism-art")
  const canvas = art?.querySelector("canvas")
  const slot = hero.querySelector<HTMLElement>(".prism-slot")
  const copy = hero.querySelector<HTMLElement>(".hero-copy")
  if (!art || !canvas || !slot || !copy) return

  const setRenderer = (renderer: Renderer) => {
    art.dataset.renderer = renderer
  }

  if (!("gpu" in navigator)) {
    setRenderer("static")
    return
  }

  const pendingTimer = window.setTimeout(() => {
    if (art.dataset.renderer === "pending") setRenderer("static")
  }, PENDING_TIMEOUT_MS)

  start({ hero, art, canvas, slot, copy, setRenderer }).catch((error: unknown) => {
    setRenderer("static")
    console.warn("Prism uses its static frame:", error)
  }).finally(() => window.clearTimeout(pendingTimer))
}

interface Mount {
  hero: HTMLElement
  art: HTMLElement
  canvas: HTMLCanvasElement
  slot: HTMLElement
  copy: HTMLElement
  setRenderer: (renderer: Renderer) => void
}

async function start({ hero, canvas, slot, copy, setRenderer }: Mount): Promise<void> {
  const [api, sceneApi, presentation] = await Promise.all([
    import("vgpu"),
    import("../vendor/vgpu/prism/scene/scene"),
    import("../vendor/vgpu/prism/pipelines/shared/presentation/index"),
  ])

  const gpu = await api.init({ powerPreference: "low-power", label: "aether-prism" })
  let failed = false
  const fail = (error: unknown) => {
    if (failed || gpu.disposed) return
    failed = true
    setRenderer("static")
    console.warn("Prism uses its static frame:", error)
  }
  gpu.onError(fail)
  void gpu.gpu.lost.then(fail)

  const screen = api.surface(gpu, canvas, { dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
  const scene = sceneApi.createScene(gpu, screen.size, "aether-prism")

  // Frame the prism inside the slot; on wide screens match the copy's height.
  const layout = () => {
    sceneApi.resizeScene(scene, screen.size)
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const aligned = width > 700 ? copy : slot
    sceneApi.setFramingViewport(scene, {
      left: slot.offsetLeft / width,
      top: aligned.offsetTop / height,
      right: (slot.offsetLeft + slot.offsetWidth) / width,
      bottom: (aligned.offsetTop + aligned.offsetHeight) / height,
    })
  }

  let elapsed = 0
  const draw = (reveal?: { revealProgress: number; beamWidthReveal: number }) => {
    api.frame(gpu, (frame) => {
      layout()
      sceneApi.presentScene(scene, screen, frame, elapsed, true, reveal)
    })
  }

  layout()
  // Shader compilation can take a moment; the still image covers it.
  await sceneApi.prepareScene(scene, screen)
  if (failed) return

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)")
  let visible = true

  // Intro: the frame fades up from black and the beam opens from its centre line.
  if (reduceMotion.matches) {
    draw()
    await gpu.settled()
    if (failed) return
    setRenderer("vgpu")
  } else {
    setRenderer("vgpu")
    const startedAt = performance.now()
    for (;;) {
      elapsed = (performance.now() - startedAt) / 1000
      const { opacity, beamWidth } = presentation.heroRevealProgress(elapsed)
      draw({ revealProgress: opacity, beamWidthReveal: beamWidth })
      await gpu.settled()
      if (failed) return
      if (opacity >= 1 && beamWidth >= 1) break
      await nextFrame()
    }
  }

  // Pointer: ease the lamp and camera towards the cursor, then go idle again.
  const target = { x: 0.5, y: 0.5 }
  const current = { x: 0.5, y: 0.5 }
  let animating = false

  const apply = () => {
    sceneApi.setLampAim(
      scene,
      0.5 + (current.x - 0.5) * LAMP_RANGE * 2,
      0.5 + (current.y - 0.5) * LAMP_RANGE * 2,
    )
    sceneApi.setOrbit(scene, (current.x - 0.5) * ORBIT_RANGE * 2, (current.y - 0.5) * ORBIT_RANGE * 2)
  }

  const animate = async () => {
    if (animating) return
    animating = true
    try {
      while (!failed && visible && !document.hidden) {
        const dx = target.x - current.x
        const dy = target.y - current.y
        const settled = Math.abs(dx) < SETTLE_EPSILON && Math.abs(dy) < SETTLE_EPSILON
        current.x = settled ? target.x : current.x + dx * EASE
        current.y = settled ? target.y : current.y + dy * EASE
        apply()
        draw()
        await gpu.settled()
        if (settled) break
        await nextFrame()
      }
    } catch (error) {
      fail(error)
    } finally {
      animating = false
    }
  }

  hero.addEventListener("pointermove", (event) => {
    if (failed || reduceMotion.matches || event.pointerType === "touch") return
    const rect = hero.getBoundingClientRect()
    target.x = clamp01((event.clientX - rect.left) / rect.width)
    target.y = clamp01((event.clientY - rect.top) / rect.height)
    void animate()
  })
  hero.addEventListener("pointerleave", () => {
    target.x = 0.5
    target.y = 0.5
    void animate()
  })

  let resizeFrame = 0
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      if (!failed) draw()
    })
  }).observe(canvas)

  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true
  }).observe(canvas)
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
