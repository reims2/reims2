import { mdiArrowLeftRight, mdiGlasses, mdiHumanMaleFemale } from '@mdi/js'
import { Glasses, Eye, EyeSearch } from '~/model/GlassesModel'

const isAllowedStep = (number:number) => {
  if (number == null || !number) return true // we don't handle that
  if (Number.isInteger(number)) return true
  const allowed = [0, 0.2, 0.25, 0.5, 0.7, 0.75]
  const decimalPart = Math.abs(parseFloat((number % 1).toFixed(2))) // thanks agaiun JS, this is next level stupid
  if (allowed.includes(decimalPart)) return true
  return false
}

export const locationNames = {
  sa: 'Santa Ana',
  sm: 'San Miguel'
}

export const eyeRules = {
  sphere: [
    (v:any) => (v != null && v !== '') || 'Required',
    (v:any) => !isNaN(parseFloat(v)) || 'Enter a valid number',
    (v:any) => (v >= -30 && v <= 30) || 'Out of range',
    (v:any) => isAllowedStep(v) || 'Not an allowed step'
  ],
  cylinder: [
    (v:any) => (!v || !isNaN(parseFloat(v))) || 'Enter a valid number',
    (v:any) => (!v || Math.abs(v) <= 6) || 'Out of range',
    (v:any) => isAllowedStep(v) || 'Not an allowed step'
  ],
  axis: [
    (v:any) => (v != null && v !== '') || 'Required',
    (v:any) => !isNaN(parseFloat(v)) || 'Enter a valid number',
    (v:any) => Number.isInteger(parseFloat(v)) || 'Must be an integer',
    (v:any) => v >= 0 || 'Must be positive',
    (v:any) => v <= 180 || 'Maximum is 180',
    (v:any) => !v || v.length >= 3 || 'Enter 3 digits (include leading zero)'
  ],
  add: [
    (v:any) => (v != null && v !== '') || 'Required for multifocals',
    (v:any) => !isNaN(parseFloat(v)) || 'Enter a valid number',
    (v:any) => v >= 0 || 'Must be positive',
    (v:any) => v <= 8 || 'Maximum is 8',
    (v:any) => isAllowedStep(v) || 'Not an allowed step'
  ]
}
export const generalEyeData = [
  {
    id: 'glassesType',
    label: 'Type',
    items: ['single', 'multifocal'],
    rules: [(v:any) => (v && ('single'.startsWith(v) || 'multifocal'.startsWith(v))) || 'Enter s for single or m for multifocal'],
    hint: '(s)ingle or (m)ultifocal',
    first: true,
    icon: mdiGlasses,
    desc: 'Glasses type (single or multifocal)'
  },
  {
    id: 'glassesSize',
    label: 'Size',
    items: ['small', 'medium', 'large', 'child'],
    hint: '(s)mall, (m)edium, (l)arge or (c)hild',
    rules: [(v:any) => (v && ('small'.startsWith(v) || 'medium'.startsWith(v) || 'large'.startsWith(v) || 'child'.startsWith(v))) ||
      'Enter s for small, m for medium, l for large or c for child'],
    icon: mdiArrowLeftRight,
    desc: 'Glasses size (small, medium, large or child)'
  },
  {
    id: 'appearance',
    label: 'Appearance',
    items: ['neutral', 'feminine', 'masculine'],
    hint: '(n)eutral, (f)eminine or (m)asculine',
    rules: [(v:any) => (v && ('neutral'.startsWith(v) || 'feminine'.startsWith(v) || 'masculine'.startsWith(v))) ||
      'Enter n for neutral, f for feminine or m for masculine'],
    icon: mdiHumanMaleFemale,
    desc: 'Glasses appearance (neutral, feminine or masculine)'
  }
]

export function deepCopyGlasses(oldGlasses:any) {
  const newGlasses:Glasses = Object.assign({}, oldGlasses)
  const newOd:any = {}
  const newOs:any = {}
  for (const key of Object.keys(oldGlasses.od)) {
    // copy to new object and convert to Number at once
    newOd[key] = Number(oldGlasses.od[key])
    newOs[key] = Number(oldGlasses.os[key])
  }
  newGlasses.od = newOd
  newGlasses.os = newOs
  return newGlasses
}

export function matchesAsCsvUri(matches:Glasses[]) {
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
    row += glass.score?.toFixed(3)
    return row
  })
  // add header
  csvRows.unshift('"SKU";"OD sphere";"OD cylinder";"OD axis";"OD additional";"OS sphere";"OS cylinder";"OS axis";"OS additional";"PhilScore"')
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'))
}

export function dispensedAsCsv(glasses:Glasses[]) {
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
  csvRows.unshift('"Old SKU";"OD sphere";"OD cylinder";"OD axis";"OD additional";"OS sphere";"OS cylinder";"OS axis";"OS additional";"Date of dispension"')
  return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'))
}

/** convert all props to number type and return as new object */
export function propsAsNumber(obj:any):Record<string, number> {
  const temp = JSON.parse(JSON.stringify(obj))
  Object.keys(temp).forEach((k) => { temp[k] = Number(temp[k]) })
  return temp
}

/** Eye is fixed by applying step rounding and the correct sign for cylinder */
export function sanitizeEyeValues(singleEye: (Eye|EyeSearch)) : (Eye|EyeSearch) {
  const rx = propsAsNumber(singleEye)
  // easier for calculation
  if (rx.axis === 180) rx.axis = 0
  // can be empty when cyl == 0. Also force to 0 when cyl == 0just in case
  if (!rx.axis || rx.cylinder === 0) rx.axis = 0
  // can be empty in edge cases
  if (!rx.cylinder) rx.cylinder = 0
  // cylinder must be negative
  rx.cylinder = -Math.abs(rx.cylinder)
  for (const prop of ['sphere', 'cylinder', 'additional']) {
    // if variable is undefined or NaN, set to 0 (used only for cylinder as of now)
    rx[prop] = !rx[prop] ? 0 : rx[prop]
    // user input could have been 1.2 instead of 1.25, so do rounding
    const isNegative = rx[prop] < 0
    rx[prop] = Math.ceil(Math.abs(rx[prop]) / 0.25) * 0.25
    rx[prop] = isNegative ? -rx[prop] : rx[prop]
  }
  return rx as unknown as Eye
}

export function clearObjectProperties(obj:any) {
  for (const key of Object.keys(obj)) {
    obj[key] = ''
  }
}
