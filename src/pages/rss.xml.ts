import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import site from "../data/site.json"
import { getPublishedPosts, postHref } from "../lib/posts"

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts()
  return rss({
    title: `${site.name} — Writing`,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postHref(post),
      categories: post.data.tags,
    })),
  })
}
