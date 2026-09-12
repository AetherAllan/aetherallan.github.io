"use client"

import { useEffect, useRef, useState } from "react"
import type { Gpu } from "vgpu"
import type { OceanGraph } from "@/vendor/vgpu/ocean/renderer"

export function OceanArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const canvas = canvasRef.current!
    const reduce = matchMedia("(prefers-reduced-motion: reduce)")
    let disposed = false,
      visible = false,
      started = false,
      failed = false
    let gpu: Gpu | undefined
    let graph: OceanGraph | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let cleanup = () => {}
    let update = () => {}
    let pending: Promise<void> | undefined

    async function start() {
      const [api, ocean] = await Promise.all([
        import("vgpu"),
        import("@/vendor/vgpu/ocean/renderer"),
      ])
      if (disposed) return
      gpu = await api.init({ powerPreference: "low-power" })
      if (disposed) {
        gpu.dispose()
        return
      }
      const screen = api.surface(gpu, canvas, { dpr: 1 })
      graph = await ocean.createGraph(gpu, screen, "work-ocean")
      cleanup = () => {
        if (graph) ocean.destroyGraph(graph)
        gpu?.dispose()
      }
      if (disposed) return
      let drawing = false
      let time = 18
      const fail = (error: unknown) => {
        failed = true
        clearTimeout(timer)
        setReady(false)
        console.warn("Ocean uses its static frame:", error)
        visible = false
      }
      gpu.onError(fail)
      void gpu.gpu.lost.then((error) => {
        if (!disposed) fail(error)
      })
      async function draw() {
        clearTimeout(timer)
        if (disposed || failed || drawing || !visible || document.hidden || !gpu || !graph) return
        drawing = true
        try {
          // Rebuild serially on resize; never render against partially prepared targets.
          if (graph.scene.size[0] !== screen.size[0] || graph.scene.size[1] !== screen.size[1]) {
            const next = await ocean.createGraph(gpu, screen, "work-ocean-resize")
            ocean.destroyGraph(graph)
            graph = next
          }
          if (disposed) return
          ocean.renderAt(gpu, graph, screen, time)
          await gpu.settled()
          if (disposed) return
          setReady(true)
          time += 0.025
        } catch (error) {
          fail(error)
        } finally {
          drawing = false
          if (!disposed && !failed && visible && !document.hidden && !reduce.matches)
            timer = setTimeout(() => {
              if (!drawing) pending = draw()
            }, 42)
        }
      }
      update = () => {
        if (!drawing) pending = draw()
      }
      update()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !started) {
        started = true
        pending = start().catch((error) => {
          failed = true
          cleanup()
          gpu?.dispose()
          if (!disposed) console.warn("Ocean uses its static frame:", error)
        })
      } else update()
      if (!visible) clearTimeout(timer)
    })
    const resize = new ResizeObserver(() => update())
    observer.observe(canvas)
    resize.observe(canvas)
    const sync = () => {
      clearTimeout(timer)
      update()
    }
    document.addEventListener("visibilitychange", sync)
    reduce.addEventListener("change", sync)
    return () => {
      disposed = true
      clearTimeout(timer)
      observer.disconnect()
      resize.disconnect()
      document.removeEventListener("visibilitychange", sync)
      reduce.removeEventListener("change", sync)
      // Preparation and in-flight draws must settle before releasing GPU resources.
      void pending?.finally(() => {
        cleanup()
        gpu?.dispose()
      })
    }
  }, [])
  return (
    <div className="ocean-art" aria-hidden="true" data-renderer={ready ? "vgpu" : "static"}>
      <img src="/art/ocean.webp" alt="" loading="lazy" />
      <canvas ref={canvasRef} style={{ opacity: ready ? 1 : 0 }} />
    </div>
  )
}
