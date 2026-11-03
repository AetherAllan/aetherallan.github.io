import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

// The CMS writes an optional date it leaves blank as "" rather than omitting it.
const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date().optional(),
)

// Every post is a Markdown file in src/content/blog; the file name is the URL slug.
// Keep these fields in sync with .pages.yml so the CMS writes valid posts.
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: optionalDate,
    tags: z.array(z.string()).default([]),
    lang: z.enum(["en", "zh"]).default("en"),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }
