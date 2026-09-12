import { build } from "esbuild"
import { resolveShader } from "@vgpu/wgsl/runtime"
import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { init, target } from "vgpu/node"
import sharp from "sharp"
import assert from "node:assert/strict"

await mkdir(".next/prism-check", { recursive: true })
const outfile = resolve(".next/prism-check/scene.mjs")
await build({
  entryPoints: ["vendor/vgpu/prism/scene/scene.ts"],
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
const sceneApi = await import(pathToFileURL(outfile))
const gpu = await init()
const errors = []
gpu.onError((error) => errors.push(error))
try {
  for (const [name, width, height] of [
    ["prism", 1440, 760],
    ["prism-mobile", 390, 780],
  ]) {
    const screen = target(gpu, { size: [width, height] })
    const scene = sceneApi.createScene(gpu, screen.size, name)
    try {
      sceneApi.setFramingViewport(
        scene,
        width > 700
          ? { left: 0.53, top: 0.25, right: 0.97, bottom: 0.79 }
          : { left: 0.235, top: 0.147, right: 0.765, bottom: 0.416 },
      )
      await sceneApi.prepareScene(scene, screen)
      sceneApi.presentScene(scene, screen)
      const pixels = await screen.read()
      let color = 0,
        bright = 0
      for (let i = 0; i < pixels.length; i += 4) {
        const [r, g, b] = pixels.subarray(i, i + 3)
        if (Math.max(r, g, b) - Math.min(r, g, b) > 35) color++
        if (Math.max(r, g, b) > 80) bright++
      }
      assert.ok(color > width * height * 0.001, "Rainbow must be visible")
      assert.ok(bright > width * height * 0.001, "Prism must be visible")
      let leftColor = 0,
        rightColor = 0
      const centerX = width * (width > 700 ? 0.745 : 0.5)
      for (let i = 0; i < pixels.length; i += 4) {
        const [r, g, b] = pixels.subarray(i, i + 3)
        if (Math.max(r, g, b) - Math.min(r, g, b) > 60) {
          if ((i / 4) % width < centerX) leftColor++
          else rightColor++
        }
      }
      assert.ok(rightColor > leftColor * 3, "Spectrum must exit to the right")
      if (process.argv.includes("--write"))
        await sharp(pixels, { raw: { width, height, channels: 4 } })
          .webp({ quality: 90 })
          .toFile(`public/art/${name}.webp`)
      sceneApi.setLampAim(scene, 0.53, 0.53)
      sceneApi.presentScene(scene, screen)
      assert.notDeepEqual(pixels, await screen.read(), "Pointer must alter optical output")
      console.log(
        `${name}: rendered ${width}×${height}, ${color} spectral pixels; interaction verified`,
      )
    } finally {
      sceneApi.destroyScene(scene)
    }
  }
  await gpu.settled()
  assert.deepEqual(errors, [])
} finally {
  gpu.dispose()
}
