import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises"
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

async function* walk(dir) {
  for (const entry of await readdir(dir)) {
    const fullPath = path.join(dir, entry)
    if ((await stat(fullPath)).isDirectory()) {
      yield* walk(fullPath)
    } else {
      yield fullPath
    }
  }
}

function redirectPage(to) {
  return `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script>`
}

for await (const file of walk(quartzOut)) {
  const relative = path.relative(quartzOut, file)
  if (!relative.endsWith(".html") || relative === "index.html" || relative === "404.html") continue

  const slug = relative.replace(/(?:^|\/)index\.html$/, "").replace(/\.html$/, "")
  const target = `/notes/${slug}${relative.endsWith("/index.html") ? "/" : ".html"}`
  const redirectPath = path.join(dist, slug, "index.html")

  if (existsSync(redirectPath)) continue
  await mkdir(path.dirname(redirectPath), { recursive: true })
  await writeFile(redirectPath, redirectPage(target))
}

const cname = path.join(quartzOut, "CNAME")
if (existsSync(cname)) {
  await cp(cname, path.join(dist, "CNAME"))
}

console.log("Built dist with Next at / and Quartz at /notes")
