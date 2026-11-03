import { getCollection, type CollectionEntry } from "astro:content"

export type Post = CollectionEntry<"blog">

// Post dates are written in the author's local time; format them there too so a
// UTC build machine doesn't shift late-night posts to the previous day.
const SITE_TIME_ZONE = "Asia/Shanghai"

/** Published posts, newest first. Drafts stay out of every list, page and feed. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft)
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
}

export function postHref(post: Post): string {
  return `/blog/${post.id}/`
}

export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-")
}

export function tagHref(tag: string): string {
  return `/blog/tags/${tagSlug(tag)}/`
}

/** A stable spectrum band (CSS custom property) for a tag, so it keeps its color everywhere. */
export function tagBand(tag: string): string {
  let hash = 0
  for (const char of tagSlug(tag)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return `var(--s${(hash % 6) + 1})`
}

export function formatDate(date: Date, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TIME_ZONE,
    year: style === "long" ? "numeric" : undefined,
    month: style === "long" ? "long" : "short",
    day: "numeric",
  }).format(date)
}

export function postYear(post: Post): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: SITE_TIME_ZONE, year: "numeric" }).format(
    post.data.pubDate,
  )
}

/** Rough reading time: ~230 English words or ~400 CJK characters a minute, code excluded. */
export function readingMinutes(markdown: string): number {
  const prose = markdown.replace(/```[\s\S]*?```/g, " ")
  const cjkChars = prose.match(/[㐀-鿿]/g)?.length ?? 0
  const words = prose.replace(/[㐀-鿿]/g, " ").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 230 + cjkChars / 400))
}
