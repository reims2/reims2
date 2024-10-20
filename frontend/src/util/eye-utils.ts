import {
  Eye,
  OptionalEye,
  EyeKey,
  DisplayedEye,
  EyeSearch,
  SanitizedEyeSearch,
} from '@/model/GlassesModel'

/** Eye is fixed by applying step rounding and the correct sign for cylinder */
export function sanitizeEyeValues(
  singleEye: OptionalEye | DisplayedEye | EyeSearch | undefined,
): Eye | SanitizedEyeSearch {
  const rx: Eye = {
    sphere: Number(singleEye?.sphere) || 0,
    cylinder: Number(singleEye?.cylinder) || 0,
    axis: Number(singleEye?.axis) || 0,
    add: Number(singleEye?.add) || 0,
  }
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
  if (isSanitizedEyeSearch(singleEye)) {
    return {
      ...rx,
      isBAL: Boolean(singleEye.isBAL),
    } as SanitizedEyeSearch
  } else {
    return rx
  }
}

function isSanitizedEyeSearch(eye?: OptionalEye | DisplayedEye): eye is EyeSearch {
  return eye !== undefined && 'isBAL' in eye
}

export function resetEyeInput(eye?: DisplayedEye | EyeSearch) {
  if (!eye) eye = {} as DisplayedEye
  eye.sphere = ''
  eye.cylinder = ''
  eye.axis = ''
  eye.add = ''
  if ('isBAL' in eye) eye.isBAL = false
}
