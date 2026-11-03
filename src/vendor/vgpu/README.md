# vgpu prism scene

Source: https://github.com/vercel-labs/vgpu
Revision: 9a3f844e8288b11ba4e3c5a88ce03f8b9e864666
Original directory: apps/docs/app/[lang]/(home)/components/prism-background
License: MIT, Copyright (c) 2025 Vercel, Inc. See LICENSE.

Only the dependency graph reachable from `prism/scene/scene.ts` is included. The docs UI,
light theme, debug UI and renderer controller are not copied; `src/scripts/prism.ts`
owns mounting, input, resize, visibility and the static fallback.

Compatibility edit for published vgpu 0.4.1: `environment/texture.ts` uses
`dimension: "2d"` instead of upstream main's `kind: "2d"` descriptor property.

Site adjustments: mirrored lamp coordinates for left-to-right light, thinner prism depth,
narrower dispersion/beam, reduced bloom, no particle draw, and the low-quality pipeline
with its matching runtime mesh layout. `presentScene` also accepts the pipeline's
`revealProgress` / `beamWidthReveal` bind options so the hero can play the intro.

The still frames in `public/art/prism*.webp` were rendered from this scene (not
screenshots of vgpu.sh) and are shown before WebGPU is ready or where it is unavailable.
