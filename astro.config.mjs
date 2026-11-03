// @ts-check
import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import wgsl from "@vgpu/wgsl/loader-vite"

export default defineConfig({
  site: "https://aetherallan.github.io",
  trailingSlash: "always",
  integrations: [sitemap()],
  vite: {
    // The prism's WGSL shaders are imported as modules (see src/vendor/vgpu).
    plugins: [wgsl()],
  },
  markdown: {
    shikiConfig: {
      theme: "vesper",
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
