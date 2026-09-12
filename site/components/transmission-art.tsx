"use client"

import { useEffect, useRef, useState } from "react"
import type { Gpu } from "vgpu"

export function TransmissionArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false,
      failed = false,
      visible = true
    let gpu: Gpu | undefined
    let cleanup = () => {}
    let destroyScene = () => {}
    let resizeFrame = 0
    let pointerFrame = 0

    async function start() {
      const [api, sceneApi] = await Promise.all([
        import("vgpu"),
        import("@/vendor/vgpu/prism/scene/scene"),
      ])
      if (cancelled) return
      gpu = await api.init({ powerPreference: "low-power", label: "aether-prism" })
      if (cancelled) {
        gpu.dispose()
        return
      }
      function fail(error: unknown) {
        if (cancelled || gpu?.disposed) return
        failed = true
        setReady(false)
        console.warn("Prism uses its static frame:", error)
      }
      gpu.onError(fail)
      void gpu.gpu.lost.then(fail)
      const screen = api.surface(gpu, canvas!, { dpr: 1 })
      const scene = sceneApi.createScene(gpu, screen.size, "aether-prism")
      destroyScene = () => sceneApi.destroyScene(scene)
      const reduce = matchMedia("(prefers-reduced-motion: reduce)")
      // The official scene uses normalized bounds; the prism stays clear of the copy.
      function layout() {
        sceneApi.resizeScene(scene, screen.size)
        const hero = canvas!.closest(".prism-hero")!
        const slot = hero.querySelector<HTMLElement>(".prism-slot")!
        const copy = hero.querySelector<HTMLElement>(".hero-copy")!
        // Untransformed layout coordinates keep resizing independent of GSAP's scroll offsets.
        const aligned = canvas!.clientWidth > 700 ? copy : slot
        sceneApi.setFramingViewport(scene, {
          left: slot.offsetLeft / canvas!.clientWidth,
          top: aligned.offsetTop / canvas!.clientHeight,
          right: (slot.offsetLeft + slot.offsetWidth) / canvas!.clientWidth,
          bottom: (aligned.offsetTop + aligned.offsetHeight) / canvas!.clientHeight,
        })
      }
      layout()
      await sceneApi.prepareScene(scene, screen)
      // Compilation can outlive unmount; never destroy its resources mid-compile.
      if (cancelled || failed) {
        destroyScene()
        destroyScene = () => {}
        gpu.dispose()
        return
      }
      const render = () => {
        if (cancelled || failed || !gpu) return
        api.frame(gpu, (frame) => {
          layout()
          sceneApi.presentScene(scene, screen, frame)
        })
      }
      render()
      await gpu.settled()
      if (cancelled || failed) return
      setReady(true)
      // Coalesce input and wait for GPU completion; idle pages submit no frames.
      let pendingPoint: [number, number] | undefined
      let drawing = false
      async function drawPointer() {
        if (drawing || !pendingPoint || cancelled || failed || !gpu) return
        if (document.hidden || !visible || reduce.matches) {
          pendingPoint = undefined
          return
        }
        drawing = true
        const [x, y] = pendingPoint
        pendingPoint = undefined
        try {
          sceneApi.setLampAim(scene, x, y)
          sceneApi.presentScene(scene, screen)
          await gpu.settled()
        } catch (error) {
          fail(error)
        } finally {
          drawing = false
          if (pendingPoint && !cancelled && !failed)
            pointerFrame = requestAnimationFrame(drawPointer)
        }
      }
      const pointer = (event: PointerEvent) => {
        if (failed || reduce.matches || event.pointerType === "touch") return
        const rect = canvas!.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
        pendingPoint = [0.495 + x * 0.01, 0.495 + y * 0.01]
        if (!drawing) {
          cancelAnimationFrame(pointerFrame)
          pointerFrame = requestAnimationFrame(drawPointer)
        }
      }
      const resize = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame)
        resizeFrame = requestAnimationFrame(render)
      })
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
      })
      const host = canvas!.parentElement!.parentElement!
      host.addEventListener("pointermove", pointer)
      resize.observe(canvas!)
      resize.observe(host.querySelector(".hero-copy")!)
      observer.observe(canvas!)
      cleanup = () => {
        resize.disconnect()
        observer.disconnect()
        host.removeEventListener("pointermove", pointer)
      }
    }
    const pending = start().catch((error: unknown) => {
      if (!cancelled) {
        setReady(false)
        console.warn("Prism uses its static frame:", error)
      }
      cleanup()
      destroyScene()
      destroyScene = () => {}
      gpu?.dispose()
    })
    return () => {
      cancelled = true
      cleanup()
      cancelAnimationFrame(resizeFrame)
      cancelAnimationFrame(pointerFrame)
      // Wait for pipeline preparation before releasing GPU-owned resources.
      void pending.finally(() => {
        destroyScene()
        gpu?.dispose()
      })
    }
  }, [])

  return (
    <div className="prism-art" data-renderer={ready ? "vgpu" : "static"}>
      <picture style={{ visibility: ready ? "hidden" : "visible" }}>
        <source media="(max-width: 700px)" srcSet="/art/prism-mobile.webp" />
        <img
          src="/art/prism.webp"
          alt="White light refracting through a glass prism into a spectrum of color"
          fetchPriority="high"
        />
      </picture>
      <canvas ref={canvasRef} aria-hidden="true" style={{ opacity: ready ? 1 : 0 }} />
    </div>
  )
}
