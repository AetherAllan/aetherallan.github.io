// Usage: npm run new -- "Post title" [slug]
// Creates src/content/blog/<slug>.md as a draft with today's date.
import { existsSync } from "node:fs"
import { writeFile } from "node:fs/promises"
import path from "node:path"

const [title, slugArg] = process.argv.slice(2)
if (!title) {
  console.error('Usage: npm run new -- "Post title" [slug]')
  process.exit(1)
}

const slug = (slugArg ?? title)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
if (!slug) {
  console.error("The title has no Latin letters to build a slug from; pass one: npm run new -- \"标题\" my-slug")
  process.exit(1)
}

const file = path.join("src", "content", "blog", `${slug}.md`)
if (existsSync(file)) {
  console.error(`${file} already exists`)
  process.exit(1)
}

const frontmatter = `---
title: ${JSON.stringify(title)}
description: ""
pubDate: ${new Date().toISOString()}
tags: []
lang: en
draft: true
---

`

await writeFile(file, frontmatter)
console.log(`Created ${file} (draft: set draft to false to publish)`)
