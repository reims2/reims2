import { mdiArrowLeftRight, mdiGlasses, mdiHumanMaleFemale } from '@mdi/js'
import { Glasses, GeneralGlassesData, GeneralGlassesDataKey } from '@/model/GlassesModel'
import { ValidationRule, isNumber, isString } from '@/model/ReimsModel'

const isAllowedStep = (number: number) => {
  if (number == null || !number) return true // we don't handle that
  if (Number.isInteger(number)) return true
  const allowed = [0, 0.2, 0.25, 0.5, 0.7, 0.75]
  const decimalPart = Math.abs(parseFloat((number % 1).toFixed(2))) // thanks agaiun JS, this is next level stupid
  if (allowed.includes(decimalPart)) return true
  return false
}

const requiredRule = (v: unknown) => (v != null && v !== '') || 'Required'
const validNumberRule = (v: unknown) =>
  v == null ||
  v === '' ||
  isNumber(v) ||
  (isString(v) && !isNaN(parseFloat(v))) ||
  'Enter a valid number'
const allowedStepRule = (v: number) => isAllowedStep(v) || 'Not an allowed step'
const positiveRule = (v: number) => v >= 0 || 'Must be positive'

export const eyeRules = {
  sphere: [
    requiredRule,
    validNumberRule,
    (v: number) => (v >= -30 && v <= 30) || 'Out of range',
    allowedStepRule,
  ] as ValidationRule[],
  cylinder: [
    validNumberRule,
    (v: number) => Math.abs(v) <= 6 || 'Out of range',
    allowedStepRule,
  ] as ValidationRule[],
  axis: [
    requiredRule,
    validNumberRule,
    (v: string) => Number.isInteger(parseFloat(v)) || 'Must be an integer',
    positiveRule,
    (v: number) => v <= 180 || 'Maximum is 180',
    (v: string) => v.length >= 3 || 'Enter 3 digits (include leading zero)',
  ] as ValidationRule[],
  add: [
    (v: unknown) => (v != null && v !== '') || 'Required for multifocals',
    validNumberRule,
    positiveRule,
    (v: number) => v <= 8 || 'Maximum is 8',
    allowedStepRule,
  ] as ValidationRule[],
}

export type GlassesMetaUIData = {
  label: string
  items: GeneralGlassesData[]
  rules: ValidationRule[]
  hint: string
  first?: boolean
  icon: string
  desc: string
}

type AllGlassesMetaUiData = {
  // eslint-disable-next-line no-unused-vars
  [key in GeneralGlassesDataKey]: GlassesMetaUIData
}

export const glassesMetaUIData: AllGlassesMetaUiData = {
  glassesType: {
    label: 'Type',
    items: ['single', 'multifocal'],
    rules: [
      (v: unknown) =>
        (isString(v) && ('single'.startsWith(v) || 'multifocal'.startsWith(v))) ||
        'Enter s for single or m for multifocal',
    ],
    hint: '(s)ingle or (m)ultifocal',
    first: true,
    icon: mdiGlasses,
    desc: 'Glasses type (single or multifocal)',
  },
  glassesSize: {
    label: 'Size',
    items: ['small', 'medium', 'large', 'child'],
    hint: '(s)mall, (m)edium, (l)arge or (c)hild',
    rules: [
      (v: unknown) =>
        (isString(v) &&
          ('small'.startsWith(v) ||
            'medium'.startsWith(v) ||
            'large'.startsWith(v) ||
            'child'.startsWith(v))) ||
        'Enter s for small, m for medium, l for large or c for child',
    ],
    icon: mdiArrowLeftRight,
    desc: 'Glasses size (small, medium, large or child)',
  },
  appearance: {
    label: 'Appearance',
    items: ['neutral', 'feminine', 'masculine'],
    hint: '(n)eutral, (f)eminine or (m)asculine',
    rules: [
      (v: unknown) =>
        (isString(v) &&
          ('neutral'.startsWith(v) || 'feminine'.startsWith(v) || 'masculine'.startsWith(v))) ||
        'Enter n for neutral, f for feminine or m for masculine',
    ],
    icon: mdiHumanMaleFemale,
    desc: 'Glasses appearance (neutral, feminine or masculine)',
  },
}

export function deepCopyGlasses(oldGlasses: Glasses): Glasses {
  return {
    ...oldGlasses,
    od: { ...oldGlasses.od },
    os: { ...oldGlasses.os },
    dispense: oldGlasses.dispense ? { ...oldGlasses.dispense } : undefined,
  }
}

export function isValidForRules(value: unknown, rules: ValidationRule[]): boolean {
  // run rules manually
  for (let index = 0; index < rules.length; index++) {
    const rule = rules[index]
    if (rule(value) !== true) {
      return false
    }
  }
  return true
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
