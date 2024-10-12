import { DisplayedEye, DisplayedGlasses, Eye, Glasses } from '@/model/GlassesModel'

import dayjs from 'dayjs'

export function formatEyeForDisplay(eye: Eye, withSign = true): DisplayedEye {
  return {
    sphere: formatDiopter(eye.sphere, withSign),
    cylinder: formatDiopter(eye.cylinder, withSign),
    axis: formatAxis(eye.axis),
    add: formatDiopter(eye.add, withSign),
  }
}

export function formatDiopter(val: number | undefined, withSign = true) {
  if (val === undefined) return ''
  const formatted = Math.abs(val).toFixed(2)
  if (!withSign) return formatted
  else return (val >= 0 ? '+' : '-') + formatted
}

export function formatAxis(val: number | undefined) {
  if (val === undefined) return ''
  return val.toString().padStart(3, '0')
}

export function getAndConvertSku(glasses: Glasses): string {
  if (glasses.sku != null) {
    return formatSku(glasses.sku)
  } else if (glasses.dispense?.previousSku != null) {
    return formatSku(glasses.dispense.previousSku)
  } else return '????'
}

export function formatSku(value?: number | null): string {
  if (!value) return '????'
  return value.toString().padStart(4, '0')
}

function formatDate(date: number) {
  return dayjs(date).format('DD.MM.YYYY')
}

export function formatGlassesForDisplay(
  glasses: Glasses,
  withDiopterSign = true,
): DisplayedGlasses {
  return {
    od: formatEyeForDisplay(glasses.od, withDiopterSign),
    os: formatEyeForDisplay(glasses.os, withDiopterSign),
    glassesSize: glasses.glassesSize,
    glassesType: glasses.glassesType,
    appearance: glasses.appearance,
    sku: getAndConvertSku(glasses),
    creationDate: formatDate(glasses.creationDate),
  }
}
