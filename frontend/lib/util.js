import { mdiArrowUpDown, mdiGlasses, mdiHumanMaleFemale } from '@mdi/js'

export const eyeRules = {
  sphere: [
    v => (v != null && !!v.length) || 'Required',
    v => !isNaN(parseFloat(v)) || 'Enter a valid number',
    v => (v >= -50 && v <= 50) || 'Out of range',
    v => v == null || v.length < 1 || v[0] === '+' || v[0] === '-' || (v[0] === '0' && v.length === 0) || 'Please start with + or -'
  ],
  cylinder:
     [
       v => (v != null && !!v.length) || 'Required',
       v => !isNaN(parseFloat(v)) || 'Enter a valid number',
       v => v <= 0 || 'Must be negative',
       v => v >= -8 || 'Out of range'
     ],
  axis: [
    v => (v != null && !!v.length) || 'Required',
    v => !isNaN(parseFloat(v)) || 'Enter a valid number',
    v => Number.isInteger(parseFloat(v)) || 'Must be an integer',
    v => v >= 0 || 'Must be positive',
    v => v <= 180 || 'Maximum is 180',
    // eslint-disable-next-line eqeqeq
    v => v != 0 || '0 is not allowed, use 180', // fixme ask diane if it should be allowed (but then convert it to 180!!! it's important for philscore)
    v => !v || v.length >= 3 || 'Enter 3 digits (leading zeros)'
  ],
  add:
     [
       v => (v != null && !!v.length) || 'Required for bifocals',
       v => !isNaN(parseFloat(v)) || 'Enter a valid number',
       v => v >= 0 || 'Must be positive',
       v => v <= 10 || 'Maximum is 10'
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
