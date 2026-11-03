// @ts-check
import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"

export default defineConfig({
  site: "https://aetherallan.github.io",
  trailingSlash: "always",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // Both palettes are emitted as CSS variables; global.css picks one per theme.
      themes: { light: "vitesse-light", dark: "vitesse-dark" },
      defaultColor: false,
      wrap: false,
    },
  },
  // Entry points from the previous Quartz site at /notes/.
  redirects: {
    "/notes/": "/blog/",
    "/notes/move-ctf-2025/": "/blog/tags/ctf/",
    "/notes/misc/meandnarrflow/": "/blog/me-and-narrflow/",
    "/notes/misc/how-to-define-a-referenced-sound/": "/blog/how-to-define-a-referenced-sound/",
  },
})
