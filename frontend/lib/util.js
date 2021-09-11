import { mdiArrowUpDown, mdiGlasses, mdiHumanMaleFemale } from '@mdi/js'

const isAllowedStep = (number) => {
  if (number == null || !number) return true // we don't handle that
  if (Number.isInteger(number)) return true
  const allowed = [0, 0.2, 0.25, 0.5, 0.7, 0.75]
  const decimalPart = Math.abs((number % 1).toFixed(2)) // thanks agaiun JS, this is next level stupid
  if (allowed.includes(decimalPart)) return true
  return false
}

export const eyeRules = {
  sphere: [
    v => (v != null && v !== '') || 'Required',
    v => !isNaN(parseFloat(v)) || 'Enter a valid number',
    v => (v >= -50 && v <= 50) || 'Out of range',
    v => isAllowedStep(v) || 'Not an allowed step'
  ],
  cylinder: [
    v => (v != null && v !== '') || 'Required',
    v => !isNaN(parseFloat(v)) || 'Enter a valid number',
    v => Math.abs(v) <= 8 || 'Out of range',
    v => isAllowedStep(v) || 'Not an allowed step'
  ],
  axis: [
    v => (v != null && v !== '') || 'Required',
    v => !isNaN(parseFloat(v)) || 'Enter a valid number',
    v => Number.isInteger(parseFloat(v)) || 'Must be an integer',
    v => v >= 0 || 'Must be positive',
    v => v <= 180 || 'Maximum is 180',
    v => !v || v.length >= 3 || 'Enter 3 digits (leading zeros)'
  ],
  add: [
    v => (v != null && v !== '') || 'Required for bifocals',
    v => !isNaN(parseFloat(v)) || 'Enter a valid number',
    v => v >= 0 || 'Must be positive',
    v => v <= 10 || 'Maximum is 10',
    v => isAllowedStep(v) || 'Not an allowed step'
  ]
}
export const generalEyeData = [
  {
    id: 'glassesType',
    label: 'Type',
    items: ['single', 'bifocal', 'progressive'],
    rules: [v => !!v || 'Item is required'],
    first: true,
    icon: mdiGlasses,
    desc: 'Glasses type (bifocal, single or progressive)'
  },
  {
    id: 'glassesSize',
    label: 'Size',
    items: ['small', 'medium', 'large', 'child'],
    rules: [v => !!v || 'Item is required'],
    icon: mdiArrowUpDown,
    desc: 'Glasses size (small, medium, large or child)'
  },
  {
    id: 'appearance',
    label: 'Appearance',
    items: ['neutral', 'feminine', 'masculine'],
    rules: [v => !!v || 'Item is required'],
    icon: mdiHumanMaleFemale,
    desc: 'Glasses appearance (neutral, feminine or masculine)'
  }
]

export function deepCopyGlasses(oldGlasses) {
  const newGlasses = Object.assign({}, oldGlasses)
  const newOd = {}
  const newOs = {}
  for (const key of Object.keys(oldGlasses.od)) {
    // copy to new object and convert to Number at once
    newOd[key] = Number(oldGlasses.od[key])
    newOs[key] = Number(oldGlasses.os[key])
  }
  newGlasses.od = newOd
  newGlasses.os = newOs
  return newGlasses
}
