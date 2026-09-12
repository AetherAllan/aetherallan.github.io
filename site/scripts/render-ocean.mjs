import { build } from "esbuild"
import { resolveShader } from "@vgpu/wgsl/runtime"
import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { init, target } from "vgpu/node"
import sharp from "sharp"
import assert from "node:assert/strict"

await mkdir(".next/ocean-check", { recursive: true })
const outfile = resolve(".next/ocean-check/scene.mjs")
await build({
  entryPoints: ["vendor/vgpu/ocean/renderer.ts"],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  plugins: [
    {
      name: "wgsl",
      setup(build) {
        build.onLoad({ filter: /\.wgsl$/ }, async ({ path }) => {
          const shader = await resolveShader({ entry: path, validate: "require" })
          return {
            contents: `export default ${JSON.stringify({ version: 1, wgsl: shader.wgsl, functionExports: shader.functionExports })}`,
            loader: "js",
          }
        })
      },
    },
  ],
})
const ocean = await import(pathToFileURL(outfile))
const gpu = await init()
const errors = []
gpu.onError((error) => errors.push(error))
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 1000],
  ]) {
    const screen = target(gpu, { size: [width, height] })
    const graph = await ocean.createGraph(gpu, screen, "ocean-check")
    try {
      ocean.renderAt(gpu, graph, screen, 18)
      const pixels = await screen.read()
      assert.ok(
        pixels.every((value, index) => index % 4 !== 3 || value === 255),
        "Ocean background must be opaque",
      )
      assert.ok(
        pixels.filter((v, i) => i % 4 !== 3 && v > 35).length > width * height * 0.02,
        "Ocean waves must be visible",
      )
      if (process.argv.includes("--write") && width === 1440)
        await sharp(pixels, { raw: { width, height, channels: 4 } })
          .webp({ quality: 90 })
          .toFile("public/art/ocean.webp")
      ocean.renderAt(gpu, graph, screen, 23)
      assert.notDeepEqual(pixels, await screen.read(), "Ocean must evolve with time")
      console.log(`ocean: ${width}×${height}, visible waves and time evolution verified`)
    } finally {
      ocean.destroyGraph(graph)
    }
  }
  await gpu.settled()
  assert.deepEqual(errors, [])
} finally {
  gpu.dispose()
}
