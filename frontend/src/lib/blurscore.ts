import { Eye, Glasses, GlassesEyeIndex, GlassesResult, GlassesSearch } from '@/model/GlassesModel'

// Predicted-blur matching, see docs/src/dev/ai-notes/predicted-blur-matching.md
const BLUR_PARAMS = {
  noHarmMargin: 0.25,
  balanceDrop: 1.0,
  balSeDifference: 1.0,
  limit: 0.75,
  highToleranceLimit: 1.25,
} as const

interface EyeBlur {
  blur: number
  focusError: number // > 0 is too much plus
}

const EYES = ['od', 'os'] as const
const PLANO: Eye = { sphere: 0, cylinder: 0, axis: 0, add: 0 }
const EPS = 1e-9

export default function calculateAllBlurscore(
  terms: GlassesSearch,
  glasses: Glasses[],
): GlassesResult[] {
  const isMultifocal = terms.glassesType === 'multifocal'
  const scored = EYES.filter((key) => !terms[key].isBAL)
  const planoBlur = Object.fromEntries(
    scored.map((key) => [key, calcEyeBlur(terms[key], PLANO, isMultifocal).blur]),
  ) as Record<GlassesEyeIndex, number>
  return glasses
    .filter((glass) => glass.glassesType === terms.glassesType)
    .filter((glass) => !isMultifocal || Boolean(glass.od.add && glass.os.add))
    .map((glass) => scorePair(terms, glass, scored, planoBlur))
    .filter((result) => result !== null)
    .sort(
      (a, b) =>
        compareScores(a.score, b.score) ||
        compareScores(betterEye(a), betterEye(b)) ||
        (a.sku ?? 0) - (b.sku ?? 0),
    )
}

function scorePair(
  terms: GlassesSearch,
  glass: Glasses,
  scored: GlassesEyeIndex[],
  planoBlur: Record<GlassesEyeIndex, number>,
): GlassesResult | null {
  const isMultifocal = terms.glassesType === 'multifocal'
  const balEye = EYES.find((key) => terms[key].isBAL)

  // BAL lens SE within 1 D of the other lens, so the pair looks and weighs alike
  if (balEye) {
    const seDiff = Math.abs(powerVector(glass[balEye]).m - powerVector(glass[scored[0]]).m)
    if (seDiff > BLUR_PARAMS.balSeDifference + EPS) return null
  }

  const eyes = scored.map((key) => ({ key, ...calcEyeBlur(terms[key], glass[key], isMultifocal) }))
  if (eyes.some((eye) => eye.blur > planoBlur[eye.key] + BLUR_PARAMS.noHarmMargin + EPS))
    return null
  if (
    eyes.length === 2 &&
    Math.abs(eyes[0].focusError - eyes[1].focusError) > BLUR_PARAMS.balanceDrop + EPS
  )
    return null

  // a pair is judged by its worse eye
  const score = Math.max(...eyes.map((eye) => eye.blur))
  if (!(score < Math.max(...scored.map((key) => planoBlur[key])) - EPS)) return null
  const limit = terms.highTolerance ? BLUR_PARAMS.highToleranceLimit : BLUR_PARAMS.limit
  if (score > limit + EPS) return null

  const od = eyes.find((eye) => eye.key === 'od')
  const os = eyes.find((eye) => eye.key === 'os')
  return {
    ...glass,
    score,
    odScore: od?.blur ?? 0,
    osScore: os?.blur ?? 0,
  }
}

// blur strength of the leftover error, the length of its power vector
function calcEyeBlur(rx: Eye, lens: Eye, isMultifocal: boolean): EyeBlur {
  const rxVector = powerVector(rx)
  const lensVector = powerVector(lens)
  const dM = lensVector.m - rxVector.m
  const dJ = Math.hypot(lensVector.j0 - rxVector.j0, lensVector.j45 - rxVector.j45)
  const distanceBlur = Math.hypot(dM, dJ)
  if (!isMultifocal) return { blur: distanceBlur, focusError: dM }

  const dNear = dM + (lens.add ?? 0) - (rx.add ?? 0)
  return { blur: Math.max(distanceBlur, Math.hypot(dNear, dJ)), focusError: dM }
}

function powerVector(eye: Eye) {
  const angle = (eye.axis * Math.PI) / 90
  return {
    m: eye.sphere + eye.cylinder / 2,
    j0: -(eye.cylinder / 2) * Math.cos(angle),
    j45: -(eye.cylinder / 2) * Math.sin(angle),
  }
}

// graded good or better in the notes
export function isGoodBlur(score: number): boolean {
  return score <= 0.5 + EPS
}

function betterEye(result: GlassesResult): number {
  return Math.min(result.odScore, result.osScore)
}

// float noise from cos and sin shouldn't decide the order
export function compareScores(a: number, b: number): number {
  return Math.abs(a - b) > EPS ? a - b : 0
}
