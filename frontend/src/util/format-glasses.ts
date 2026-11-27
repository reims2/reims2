import { DisplayedEye, DisplayedGlasses, Eye, Glasses, GlassesType } from '@/model/GlassesModel'

import dayjs from 'dayjs'

// forInput keeps plain digits and a hyphen so the values can be edited and parsed again
export function formatEyeForDisplay(
  eye: Eye,
  glassesType: GlassesType,
  forInput = false,
): DisplayedEye {
  const diopter = (val: number | undefined) =>
    forInput ? formatDiopter(val, false) : displayDiopter(val)
  return {
    sphere: diopter(eye.sphere),
    cylinder: diopter(eye.cylinder),
    axis: formatAxis(eye.axis),
    add: glassesType !== 'single' ? diopter(eye.add) : '',
  }
}

export function formatDiopter(val: number | undefined, withPlusSign = true) {
  if (val === undefined) return ''
  const formatted = val.toFixed(2)
  if (withPlusSign && val >= 0) return '+' + formatted
  else return formatted
}

// read-only values: a true minus as wide as the plus, and zero without a sign
export function displayDiopter(val: number | undefined) {
  if (val === undefined) return ''
  if (val === 0) return '0.00'
  return (val > 0 ? '+' : '\u2212') + Math.abs(val).toFixed(2)
}

export function formatAxis(val: number | undefined) {
  if (val === undefined) return ''
  return val.toString().padStart(3, '0')
}

export function getAndConvertSku(glasses: Glasses): string {
  return formatSku(glasses.sku ?? glasses.dispense?.previousSku)
}

export function formatSku(value?: number | null): string {
  if (!value) return '????'
  return value.toString().padStart(4, '0')
}

function formatDate(date: string) {
  return dayjs(date).format('DD.MM.YYYY')
}

export function formatGlassesForDisplay(glasses: Glasses, forInput = false): DisplayedGlasses {
  return {
    od: formatEyeForDisplay(glasses.od, glasses.glassesType, forInput),
    os: formatEyeForDisplay(glasses.os, glasses.glassesType, forInput),
    glassesSize: glasses.glassesSize,
    glassesType: glasses.glassesType,
    appearance: glasses.appearance,
    sku: getAndConvertSku(glasses),
    creationDate: formatDate(glasses.creationDate),
  }
}
