import {
  Eye,
  OptionalEye,
  EyeKey,
  DisplayedEye,
  EyeSearch,
  SanitizedEyeSearch,
  isEyeSearch,
} from '@/model/GlassesModel'

/** Eye is fixed by applying step rounding and the correct sign for cylinder */
export function sanitizeEyeValues(singleEye: EyeSearch): SanitizedEyeSearch
export function sanitizeEyeValues(singleEye?: OptionalEye | DisplayedEye | EyeSearch): Eye
export function sanitizeEyeValues(singleEye?: OptionalEye | DisplayedEye | EyeSearch) {
  const rx: Eye = {
    sphere: Number(singleEye?.sphere) || 0,
    cylinder: Number(singleEye?.cylinder) || 0,
    axis: Number(singleEye?.axis) || 0,
    add: Number(singleEye?.add) || 0,
  }
  // easier for calculation, and axis means nothing without cylinder
  if (rx.axis === 180 || rx.cylinder === 0) rx.axis = 0
  rx.cylinder = -Math.abs(rx.cylinder)

  const eyeKeys: EyeKey[] = ['sphere', 'cylinder', 'add']
  for (const prop of eyeKeys) {
    // user input could have been 1.2 instead of 1.25, so do rounding
    const value = rx[prop] ?? 0
    const rounded = Math.ceil(Math.abs(value) / 0.25) * 0.25
    rx[prop] = value < 0 ? -rounded : rounded
  }
  if (singleEye && isEyeSearch(singleEye)) return { ...rx, isBAL: Boolean(singleEye.isBAL) }
  return rx
}

export function resetEyeInput(eye: DisplayedEye | EyeSearch) {
  eye.sphere = ''
  eye.cylinder = ''
  eye.axis = ''
  eye.add = ''
  if (isEyeSearch(eye)) eye.isBAL = false
}
