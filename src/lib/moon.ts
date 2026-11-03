// Moon phase math shared by build-time components and the client scripts that
// re-render "tonight's moon" with the visitor's clock. Accuracy is about half a
// day, which is plenty for an icon; this is not an ephemeris.

const SYNODIC_MONTH_DAYS = 29.530588853
// A known new moon: 2000-01-06 18:14 UTC.
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14)
const DAY_MS = 86_400_000

const PHASE_NAMES = [
  { name: "New Moon", nameZh: "新月" },
  { name: "Waxing Crescent", nameZh: "蛾眉月" },
  { name: "First Quarter", nameZh: "上弦月" },
  { name: "Waxing Gibbous", nameZh: "盈凸月" },
  { name: "Full Moon", nameZh: "满月" },
  { name: "Waning Gibbous", nameZh: "亏凸月" },
  { name: "Last Quarter", nameZh: "下弦月" },
  { name: "Waning Crescent", nameZh: "残月" },
] as const

export interface MoonPhase {
  /** Position in the cycle: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  fraction: number
  /** Share of the disc that is lit, 0–1. */
  illumination: number
  /** Days since the last new moon. */
  ageDays: number
  name: string
  nameZh: string
}

export function moonPhase(date: Date): MoonPhase {
  const cycles = (date.getTime() - REFERENCE_NEW_MOON_MS) / DAY_MS / SYNODIC_MONTH_DAYS
  const fraction = ((cycles % 1) + 1) % 1
  const { name, nameZh } = PHASE_NAMES[Math.round(fraction * 8) % 8]
  return {
    fraction,
    illumination: (1 - Math.cos(2 * Math.PI * fraction)) / 2,
    ageDays: fraction * SYNODIC_MONTH_DAYS,
    name,
    nameZh,
  }
}

/**
 * SVG path for the lit part of a moon disc, as seen from the northern hemisphere
 * (waxing light on the right). The outer arc follows the limb; the inner arc is
 * the terminator, an ellipse whose width shrinks to zero at the quarters.
 */
export function litPath(fraction: number, radius = 50, center = 50): string {
  const top = `${center} ${center - radius}`
  const bottom = `${center} ${center + radius}`
  const waxing = fraction <= 0.5
  const terminatorBulge = Math.cos(2 * Math.PI * fraction)
  const terminatorRadius = (Math.abs(terminatorBulge) * radius).toFixed(3)
  const limbSweep = waxing ? 1 : 0
  const terminatorSweep = waxing === terminatorBulge > 0 ? 0 : 1
  return (
    `M ${top} A ${radius} ${radius} 0 0 ${limbSweep} ${bottom} ` +
    `A ${terminatorRadius} ${radius} 0 0 ${terminatorSweep} ${top} Z`
  )
}

export function describePhase(phase: MoonPhase): string {
  return `${phase.name} · ${Math.round(phase.illumination * 100)}% lit`
}
