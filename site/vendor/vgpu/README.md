# vgpu prism scene

Source: https://github.com/vercel-labs/vgpu
Revision: 9a3f844e8288b11ba4e3c5a88ce03f8b9e864666
Original directory: apps/docs/app/[lang]/(home)/components/prism-background
License: MIT, Copyright (c) 2025 Vercel, Inc. See LICENSE.

Only the dependency graph reachable from scene/scene.ts is included. The docs UI,
light theme, debug UI, and renderer controller are not copied. The portfolio owns
its React lifecycle and uses the original dark optical pipeline.

Compatibility edit for published vgpu 0.4.1: environment/texture.ts uses
`dimension: "2d"` instead of upstream main's `kind: "2d"` descriptor property.

Fallback images in public/art/prism*.webp are rendered from this scene, not screenshots
of vgpu.sh. Regenerate with `cd site && node scripts/render-prism.mjs --write` after
installing both root and site dependencies.

Portfolio adjustments: mirrored lamp coordinates for left-to-right light, thinner
prism depth, narrower dispersion/beam, reduced bloom, no particle draw, and the
low-quality pipeline with its matching runtime mesh layout.

## FFT ocean

`ocean/` is the renderer/shader dependency graph from `apps/docs/examples/fft-ocean`
at the same revision and under the same MIT license. The docs controller is omitted;
the portfolio supplies visibility-aware scheduling, resize handling and reduced motion.
The 512² FFT simulation and original visual tuning are retained. The presentation
shader outputs opaque alpha for use against the page background.
Regenerate its fallback with `cd site && node scripts/render-ocean.mjs --write`.
