import { DisplayedEye, DisplayedGlasses, Eye, Glasses } from '@/model/GlassesModel'

import dayjs from 'dayjs'

export function formatEyeForDisplay(eye: Eye): DisplayedEye {
  return {
    sphere: formatDiopter(eye.sphere),
    cylinder: formatDiopter(eye.cylinder),
    axis: formatAxis(eye.axis),
    add: formatDiopter(eye.add),
  }
}

export function formatDiopter(val: number | undefined) {
  if (val === undefined) return ''
  return (val >= 0 ? '+' : '-') + Math.abs(val).toFixed(2)
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

export function formatSku(value: number): string {
  return value.toString().padStart(4, '0')
}

function formatDate(date: number) {
  return dayjs(date).format('DD.MM.YYYY')
}

export function formatGlassesForDisplay(glasses: Glasses): DisplayedGlasses {
  return {
    od: formatEyeForDisplay(glasses.od),
    os: formatEyeForDisplay(glasses.os),
    glassesSize: glasses.glassesSize,
    glassesType: glasses.glassesType,
    appearance: glasses.appearance,
    sku: getAndConvertSku(glasses),
    creationDate: formatDate(glasses.creationDate),
  }
}
