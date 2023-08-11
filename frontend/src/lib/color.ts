export function calcColorGradient(
  value: number,
  startColor = '#009688',
  endColor = '#F57F17',
  startValue = 0,
  endValue = 2,
): string {
  const clampedValue = Math.max(Math.min(value, endValue), startValue)
  const ratio = (clampedValue - startValue) / (endValue - startValue)
  const r1 = parseInt(startColor.substring(1, 3), 16)
  const g1 = parseInt(startColor.substring(3, 5), 16)
  const b1 = parseInt(startColor.substring(5, 7), 16)
  const r2 = parseInt(endColor.substring(1, 3), 16)
  const g2 = parseInt(endColor.substring(3, 5), 16)
  const b2 = parseInt(endColor.substring(5, 7), 16)
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio)
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio)
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}`
}
