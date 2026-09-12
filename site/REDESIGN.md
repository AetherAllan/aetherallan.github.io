# Geist / Prism redesign

The portfolio uses Geist and Geist Mono, a black and white interface, and the dark
prism from Vercel's vgpu homepage. The original sculpture draft was replaced.
The notes content and Quartz styling are unchanged.

## Run

From the repository root:

```sh
npm ci
npm --prefix site ci
npx quartz plugin install
npm run build:pages
npm run preview:pages
```

The combined preview is http://localhost:4173. `npm --prefix site run dev` runs
only the portfolio, without the separately built `/notes/` pages.

## Verify

```sh
npm --prefix site run lint
npm --prefix site run test:gpu
npm run build:pages
```

The GPU check requires a real WebGPU device. It compiles the prism shaders,
renders desktop/mobile images, checks visible color/light and verifies that
changing the lamp position changes pixels. Root dependencies include esbuild;
install both root and site packages before running the GPU check.

Browser checks completed: desktop and mobile layout, active vgpu rendering,
idle canvas stability, contact dialog Escape/focus restoration,
no-JavaScript static art and text, and the Quartz notes entry.

The macOS Quartz build reports a duplicate GNotificationCenterDelegate library
warning in the local native-image dependencies; the full build completes.

## Source and rendering

The MIT-licensed prism source, pinned revision and compatibility adjustment are
recorded in `vendor/vgpu/README.md`. Runtime uses vgpu 0.4.1. Static fallback
images are produced from that same scene, not from screenshots or remote media.

The portfolio owns React mount/unmount, pointer input, resize, visibility,
reduced-motion behavior. It renders only on input/resize at DPR 1, coalescing input
and waiting for GPU completion. The smaller prism has left-to-right light, reduced
bloom and depth, and no particle draw. The low-quality pipeline and runtime share
the same mesh layout. The light
pipeline and docs UI are not included. Browser/device coverage beyond this Mac
has not been physically verified.

This is a local redesign. No push, merge, or live deployment has been performed.

## Navigation / ocean transition

The homepage header overlays the hero background, with navigation grouped at the
left. The rendered prism uses the copy's top/bottom bounds on desktop. `/stack/`
and its terminal component have been removed as requested.

GSAP ScrollTrigger scrubs the hero fade and ocean reveal with native page scrolling;
there is no scroll lock. The work cards enter with a small stagger. GSAP matchMedia
reverts these effects for reduced motion; content remains readable without JavaScript.

The official FFT ocean uses 512² particles at DPR 1. It initializes when visible,
waits for GPU completion between frames, and schedules the next update after 42 ms.
Hidden/offscreen scenes stop, and reduced motion renders a still. GPU tests verify
visible waves, changing time, and opaque output on desktop/mobile sizes. Browser
checks cover the transition, mobile layout, both renderers and reduced-motion content.
The first typecheck after deleting `/stack/` encountered stale generated Next types;
a fresh build regenerated them and subsequent typecheck passed.
