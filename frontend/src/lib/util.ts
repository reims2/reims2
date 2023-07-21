import { mdiArrowLeftRight, mdiGlasses, mdiHumanMaleFemale } from '@mdi/js'
import {
  Glasses,
  Eye,
  GlassesResult,
  GeneralGlassesData,
  GeneralGlassesDataKey,
  OptionalEye,
  EyeKey,
} from '@/model/GlassesModel'
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

export type GeneralGlassesUIData = {
  label: string
  items: GeneralGlassesData[]
  rules: ValidationRule[]
  hint: string
  first?: boolean
  icon: string
  desc: string
}

type AllGeneralGlassesUIData = {
  // eslint-disable-next-line no-unused-vars
  [key in GeneralGlassesDataKey]: GeneralGlassesUIData
}

export const generalEyeData: AllGeneralGlassesUIData = {
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
  const newGlasses: Glasses = Object.assign({}, oldGlasses)
  const newOd: Partial<Eye> = {}
  const newOs: Partial<Eye> = {}
  for (const key of Object.keys(oldGlasses.od)) {
    // copy to new object and convert to Number at once
    const keyTyped = key as keyof Eye
    newOd[keyTyped] = Number(oldGlasses.od[keyTyped])
    newOs[keyTyped] = Number(oldGlasses.os[keyTyped])
  }
  newGlasses.od = newOd as Eye
  newGlasses.os = newOs as Eye
  return newGlasses
}

export function matchesAsCsvUri(matches: GlassesResult[]) {
  const csvRows = matches.map((glass) => {
    let row = ''
    row += glass.sku + ';'
    row += glass.od.sphere + ';'
    row += glass.od.cylinder + ';'
    row += glass.od.axis + ';'
    row += glass.od.add + ';'
    row += glass.os.sphere + ';'
    row += glass.os.cylinder + ';'
    row += glass.os.axis + ';'
    row += glass.os.add + ';'
    row += glass.score.toFixed(3)
    return row
  })
  // add header
  csvRows.unshift(
    '"SKU";"OD sphere";"OD cylinder";"OD axis";"OD additional";"OS sphere";"OS cylinder";"OS axis";"OS additional";"PhilScore"',
  )
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'))
}

export function dispensedAsCsv(glasses: Glasses[]) {
  const csvRows = glasses.map((glass) => {
    let row = ''
    row += glass.dispense?.previousSku + ';'
    row += glass.od.sphere + ';'
    row += glass.od.cylinder + ';'
    row += glass.od.axis + ';'
    row += glass.od.add + ';'
    row += glass.os.sphere + ';'
    row += glass.os.cylinder + ';'
    row += glass.os.axis + ';'
    row += glass.os.add + ';'
    row += glass.dispense?.modifyDate + ';'
    return row
  })
  // add header
  csvRows.unshift(
    '"Old SKU";"OD sphere";"OD cylinder";"OD axis";"OD additional";"OS sphere";"OS cylinder";"OS axis";"OS additional";"Date of dispension"',
  )
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'))
}

/** convert all props to number type and return as new object */
export function propsAsNumber(obj: Record<string, any>): Record<string, number> {
  const temp = JSON.parse(JSON.stringify(obj))
  Object.keys(temp).forEach((k) => {
    temp[k] = Number(temp[k])
  })
  return temp
}

/** Eye is fixed by applying step rounding and the correct sign for cylinder */
export function sanitizeEyeValues(singleEye: OptionalEye): Eye {
  console.log('sanitizeEyeValues input', singleEye)
  const rx = propsAsNumber(singleEye) as unknown as OptionalEye
  // easier for calculation
  if (rx.axis === 180) rx.axis = 0
  // can be empty when cyl == 0. Also force to 0 when cyl == 0just in case
  if (!rx.axis || rx.cylinder === 0) rx.axis = 0
  // cylinder must be negative
  if (!rx.cylinder) rx.cylinder = 0
  rx.cylinder = -Math.abs(rx.cylinder)

  const eyeKeys: EyeKey[] = ['sphere', 'cylinder', 'add']
  for (const prop of eyeKeys) {
    // if variable is undefined or NaN, set to 0 (used only for cylinder as of now)
    let newValue = rx[prop] == null || isNaN(rx[prop] as number) ? 0 : (rx[prop] as number)
    // user input could have been 1.2 instead of 1.25, so do rounding
    const isNegative = newValue < 0
    newValue = Math.ceil(Math.abs(newValue) / 0.25) * 0.25
    rx[prop] = isNegative ? -newValue : newValue
  }
  console.log('sanitizeEyeValues result', rx)
  return rx as Eye
}

export function clearObjectProperties(obj: any) {
  for (const key of Object.keys(obj)) {
    obj[key] = ''
  }
}

export enum EyeEnum {
  // eslint-disable-next-line no-unused-vars
  OD = 'od',
  // eslint-disable-next-line no-unused-vars
  OS = 'os',
}
