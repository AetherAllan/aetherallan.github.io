import { cp, mkdir, rm, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const dist = path.join(root, "dist")
const nextOut = path.join(root, "site", "out")
const quartzOut = path.join(root, ".quartz-dist")

for (const requiredPath of [nextOut, quartzOut]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Missing build output: ${path.relative(root, requiredPath)}`)
  }
}

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(nextOut, dist, { recursive: true })
await writeFile(path.join(dist, ".nojekyll"), "")
await mkdir(path.join(dist, "notes"), { recursive: true })
await cp(quartzOut, path.join(dist, "notes"), { recursive: true })

const cname = path.join(quartzOut, "CNAME")
if (existsSync(cname)) {
  await cp(cname, path.join(dist, "CNAME"))
}

console.log("Built dist with Next at / and Quartz at /notes")
