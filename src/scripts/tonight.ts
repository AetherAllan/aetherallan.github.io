// Pages are built ahead of time, so "tonight" values are rendered with the
// build date. Redraw them with the visitor's clock; without JavaScript the
// build-date values simply stay.
import { litPath, moonPhase } from "../lib/moon"

const phase = moonPhase(new Date())

for (const path of document.querySelectorAll<SVGPathElement>("[data-tonight-lit]")) {
  const radius = Number(path.dataset.radius ?? 50)
  const center = Number(path.dataset.center ?? 50)
  path.setAttribute("d", litPath(phase.fraction, radius, center))
}

const text: Record<string, string> = {
  name: phase.name,
  dark: `${Math.round((1 - phase.illumination) * 100)}%`,
}
for (const element of document.querySelectorAll<HTMLElement>("[data-tonight-text]")) {
  const value = text[element.dataset.tonightText ?? ""]
  if (value) element.textContent = value
}
