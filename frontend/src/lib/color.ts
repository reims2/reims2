// PhilScore bands, lower is better; each clears 4.5:1 against white text
const scoreBands = [
  { below: 0.5, color: '#00695c' },
  { below: 1, color: '#4f6b1c' },
  { below: 1.5, color: '#8a5300' },
]

export function scoreColor(score: number): string {
  return scoreBands.find((band) => score < band.below)?.color ?? '#b23a00'
}
