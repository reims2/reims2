import { Eye, Glasses, GlassesResult, GlassesSearch } from '@/model/GlassesModel'

// Predicted-blur matching, see docs/src/dev/ai-notes/predicted-blur-matching.md
export const BLUR_PARAMS = {
  astigmatismWeight: 2, // w
  cylinderRelief: 2, // k
  extraMinusWeight: 1.5, // m
  extraReadingWeight: 0.75, // n
  worseEyeShare: 0.75, // e
  balanceFree: 0.25,
  balanceSlope: 0.5,
  balanceDrop: 1.0,
  noHarmMargin: 0.25,
  balSeDifference: 1.0,
  limit: 0.75,
  highToleranceLimit: 1.25,
} as const

export type BlurGrade = 'excellent' | 'good' | 'fair' | 'poor'

export interface EyeError {
  focusError: number // > 0 is too much plus
  leftoverCylinder: number
  readingError: number | null // multifocal only
}

export interface BlurResult extends GlassesResult {
  grade: BlurGrade
  odError: EyeError | null // null for a BAL eye
  osError: EyeError | null
}

interface EyeBlur {
  blur: number
  error: EyeError
}

const EYES = ['od', 'os'] as const
const PLANO: Eye = { sphere: 0, cylinder: 0, axis: 0, add: 0 }
const EPS = 1e-9

export default function calculateAllBlurscore(
  terms: GlassesSearch,
  glasses: Glasses[],
): BlurResult[] {
  const isMultifocal = terms.glassesType === 'multifocal'
  return glasses
    .filter((glass) => glass.glassesType === terms.glassesType)
    .filter((glass) => !isMultifocal || Boolean(glass.od.add && glass.os.add))
    .map((glass) => scorePair(terms, glass))
    .filter((result) => result !== null)
    .sort(
      (a, b) =>
        compareScores(a.score, b.score) ||
        compareScores(worseEye(a), worseEye(b)) ||
        (a.sku ?? 0) - (b.sku ?? 0),
    )
}

function scorePair(terms: GlassesSearch, glass: Glasses): BlurResult | null {
  const isMultifocal = terms.glassesType === 'multifocal'
  const scored = EYES.filter((key) => !terms[key].isBAL)
  const balEye = EYES.find((key) => terms[key].isBAL)

  // BAL lens SE within 1 D of the other lens, so the pair looks and weighs alike
  if (balEye) {
    const seDiff = Math.abs(powerVector(glass[balEye]).m - powerVector(glass[scored[0]]).m)
    if (seDiff > BLUR_PARAMS.balSeDifference + EPS) return null
  }

  const eyes = scored.map((key) => ({
    key,
    ...calcEyeBlur(terms[key], glass[key], isMultifocal),
    planoBlur: calcEyeBlur(terms[key], PLANO, isMultifocal).blur,
  }))
  if (eyes.some((eye) => eye.blur > eye.planoBlur + BLUR_PARAMS.noHarmMargin + EPS)) return null

  let score = combineEyes(eyes.map((eye) => eye.blur))
  if (eyes.length === 2) {
    const imbalance = Math.abs(eyes[0].error.focusError - eyes[1].error.focusError)
    if (imbalance > BLUR_PARAMS.balanceDrop + EPS) return null
    score += BLUR_PARAMS.balanceSlope * Math.max(0, imbalance - BLUR_PARAMS.balanceFree)
  }
  if (!(score < combineEyes(eyes.map((eye) => eye.planoBlur)) - EPS)) return null
  const limit = terms.highTolerance ? BLUR_PARAMS.highToleranceLimit : BLUR_PARAMS.limit
  if (score > limit + EPS) return null

  const od = eyes.find((eye) => eye.key === 'od')
  const os = eyes.find((eye) => eye.key === 'os')
  return {
    ...glass,
    score,
    grade: calcGrade(score),
    odScore: od?.blur ?? 0,
    osScore: os?.blur ?? 0,
    odError: od?.error ?? null,
    osError: os?.error ?? null,
  }
}

function calcEyeBlur(rx: Eye, lens: Eye, isMultifocal: boolean): EyeBlur {
  const rxVector = powerVector(rx)
  const lensVector = powerVector(lens)
  const dM = lensVector.m - rxVector.m
  const dJ = Math.hypot(lensVector.j0 - rxVector.j0, lensVector.j45 - rxVector.j45)

  const astigmatism =
    (BLUR_PARAMS.astigmatismWeight * dJ) / (1 + Math.abs(rx.cylinder) / BLUR_PARAMS.cylinderRelief)
  let focus = Math.abs(dM)
  // hyperopes and readers can't focus through extra minus
  if (dM < 0 && !isMultifocal && rxVector.m > 0) focus *= BLUR_PARAMS.extraMinusWeight
  const distanceBlur = Math.hypot(focus, astigmatism)
  if (!isMultifocal) {
    return {
      blur: distanceBlur,
      error: { focusError: dM, leftoverCylinder: 2 * dJ, readingError: null },
    }
  }

  // too much reading power can be made up for by holding the page closer
  const dNear = dM + (lens.add ?? 0) - (rx.add ?? 0)
  const near = dNear < 0 ? -dNear : BLUR_PARAMS.extraReadingWeight * dNear
  return {
    blur: Math.max(distanceBlur, Math.hypot(near, astigmatism)),
    error: { focusError: dM, leftoverCylinder: 2 * dJ, readingError: dNear },
  }
}

function powerVector(eye: Eye) {
  const angle = (eye.axis * Math.PI) / 90
  return {
    m: eye.sphere + eye.cylinder / 2,
    j0: -(eye.cylinder / 2) * Math.cos(angle),
    j45: -(eye.cylinder / 2) * Math.sin(angle),
  }
}

// the worse eye counts more, a pair is judged by its weak point
function combineEyes(blurs: number[]): number {
  const worse = Math.max(...blurs)
  const better = Math.min(...blurs)
  return BLUR_PARAMS.worseEyeShare * worse + (1 - BLUR_PARAMS.worseEyeShare) * better
}

function calcGrade(score: number): BlurGrade {
  if (score <= 0.25 + EPS) return 'excellent'
  if (score <= 0.5 + EPS) return 'good'
  if (score <= 0.75 + EPS) return 'fair'
  return 'poor'
}

function worseEye(result: BlurResult): number {
  return Math.max(result.odScore, result.osScore)
}

// float noise from cos and sin shouldn't decide the order
function compareScores(a: number, b: number): number {
  return Math.abs(a - b) > EPS ? a - b : 0
}
