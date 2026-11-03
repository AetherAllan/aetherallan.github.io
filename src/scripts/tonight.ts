// Pages are built ahead of time, so every "tonight" moon is drawn with the build
// date. Redraw them with the visitor's clock; without JavaScript the build-date
// moon simply stays.
import { litPath, moonPhase } from "../lib/moon"

const phase = moonPhase(new Date())

for (const path of document.querySelectorAll<SVGPathElement>("[data-tonight-lit]")) {
  const radius = Number(path.dataset.radius ?? 50)
  const center = Number(path.dataset.center ?? 50)
  path.setAttribute("d", litPath(phase.fraction, radius, center))
}

const text: Record<string, string> = {
  name: phase.name,
  nameZh: phase.nameZh,
  illumination: `${Math.round(phase.illumination * 100)}% lit`,
  age: `Day ${phase.ageDays.toFixed(1)} of 29.5`,
}
for (const element of document.querySelectorAll<HTMLElement>("[data-tonight-text]")) {
  const value = text[element.dataset.tonightText ?? ""]
  if (value) element.textContent = value
}

for (const element of document.querySelectorAll<HTMLElement>("[data-tonight-root]")) {
  element.style.setProperty("--glow", phase.illumination.toFixed(3))
}
