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
