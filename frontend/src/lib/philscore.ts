import {
  Glasses,
  Eye,
  GlassesSearch,
  GlassesResult,
  hasAdd,
  SanitizedEyeSearch,
} from '@/model/GlassesModel'

// Glasses with a sphere/cylinder/additional delta of more than this will be removed
const NORMAL_TOLERANCE = 0.5
const HIGH_TOLERANCE = 1.0

export default function calculateAllPhilscore(
  terms: GlassesSearch,
  glasses: Glasses[],
): GlassesResult[] {
  const rxOd = terms.od
  const rxOs = terms.os
  const isSinglefocal = terms.glassesType === 'single'
  const tolerance =
    terms.highTolerance !== null && terms.highTolerance ? HIGH_TOLERANCE : NORMAL_TOLERANCE

  return glasses
    .slice()
    .filter((glass) => terms.glassesType === glass.glassesType)
    .filter((glass) => filterLens(rxOd, glass.od, tolerance, isSinglefocal, rxOs))
    .filter((glass) => filterLens(rxOs, glass.os, tolerance, isSinglefocal, rxOd))
    .map((glass) => {
      const odScore = rxOd.isBAL ? 0 : calcSingleEyePhilscore(rxOd, glass.od, isSinglefocal)
      const osScore = rxOs.isBAL ? 0 : calcSingleEyePhilscore(rxOs, glass.os, isSinglefocal)

      const result: GlassesResult = {
        ...glass,
        score: odScore + osScore,
        odScore,
        osScore,
      }
      return result
    })
    .sort((a, b) => (a.score > b.score ? 1 : -1))
}

function filterLens(
  targetEyeRx: SanitizedEyeSearch,
  lens: Eye,
  tolerance: number,
  isSinglefocal: boolean,
  otherEyeRx: SanitizedEyeSearch,
): boolean {
  if (!targetEyeRx.isBAL) {
    if (!checkForSingleAxisTolerance(targetEyeRx, lens)) return false
    if (!checkForTolerances(lens, targetEyeRx, tolerance)) return false
    if (!isSinglefocal && !checkForAdditionalTolerance(lens, targetEyeRx, tolerance)) return false
  } else {
    // is disabled/BAL, so check for RX of other eye
    if (!checkForTolerances(lens, otherEyeRx, 1.0)) return false
  }
  return true
}

function calcAxisTolerance(cylinder: number): number {
  // Some arbitrary numbers from REIMS1, in short: Smaller cylinders allow for a greater tolerance.
  const toleranceYValues = [7, 8, 9, 10, 13, 15, 20, 25, 35, 90]
  const toleranceXValues = [-4, -3, -2, -1.75, -1.25, -1, -0.75, -0.5, -0.25, 0]
  // Implement simple "lookup table"
  let result = toleranceYValues[0]
  for (let i = 0; i < toleranceXValues.length; i++) {
    if (cylinder < toleranceXValues[i]) break
    result = toleranceYValues[i]
  }
  return result
}

function checkForSingleAxisTolerance(rx: Eye, lens: Eye): boolean {
  /* The AtoLTF Test: We filter out all glasses that have a too big axis difference */
  const allowedTolerance = calcAxisTolerance(lens.cylinder)

  // Now calculate the minima and maxima. We have two pairs of min and max because we have to account for "wraparound"
  // An axis of 0 with a tolerance of plus and minus 10, has to be between 170-180 and 0-10, because 180 wraps around to 0.
  // This is all we do here really
  const axisSub = rx.axis - allowedTolerance
  const axisAdd = rx.axis + allowedTolerance

  const minimum1 = axisAdd > 180 || axisSub < 0 ? 0 : axisSub
  const maximum1 = axisAdd > 180 ? axisAdd - 180 : axisAdd

  let minimum2 = axisAdd > 180 || axisSub < 0 ? axisSub : 0
  if (axisSub < 0) minimum2 += 180

  const maximum2 = axisAdd > 180 || axisSub < 0 ? 180 : 0

  // Now return true if the lens axis lays inbetween one of the two min-max pairs
  return (
    (lens.axis >= minimum1 && lens.axis <= maximum1) ||
    (lens.axis >= minimum2 && lens.axis <= maximum2)
  )
}

function checkForTolerances(lens: Eye, rx: Eye, tolerance: number): boolean {
  /**
   * Check if the rx itself or any of its spherical equivalents is in the tolerance range of sphere+cylinder of lens.
   */
  for (const equivalent of calcSphericalEquivalents(rx.sphere, rx.cylinder)) {
    if (
      Math.abs(equivalent.sphere - lens.sphere) <= tolerance &&
      Math.abs(equivalent.cylinder - lens.cylinder) <= tolerance
    )
      return true
  }
  return false
}

function checkForAdditionalTolerance(eye: Eye, rx: Eye, tolerance: number): boolean {
  if (!hasAdd(eye) || !hasAdd(rx)) return false
  return Math.abs(eye.add - rx.add) <= tolerance
}

function calcSingleEyePhilscore(rx: Eye, lens: Eye, isSinglefocal: boolean): number {
  /**
   * rx: desired values for a single eye
   * lens: single eye of one available glasses
   * glassesType: single or multifocal
   */
  const initScore = calcInitialDiffScore(rx, lens, isSinglefocal)
  let score = initScore

  /* In the following that score gets improved (=smaller) or worse (=bigger) to account for some optometry special cases */

  score += applyMutuallyExclusiveRules(score, rx, lens)

  if (!isSinglefocal) score += multiFocalAddScore(rx.add, lens.add)

  score += smallerLensSphereScore(rx.sphere, lens.sphere)

  return score
}

function calcInitialDiffScore(rx: Eye, lens: Eye, isSinglefocal: boolean): number {
  const sphereDiff = Math.abs(lens.sphere - rx.sphere)
  const cylinderDiff = Math.abs(lens.cylinder - rx.cylinder)
  const addDiff = !isSinglefocal && hasAdd(lens) && hasAdd(rx) ? Math.abs(lens.add - rx.add) : 0

  let axisDiff = Math.abs(lens.axis - rx.axis)
  axisDiff = axisDiff > 90 ? 180 - axisDiff : axisDiff // account for wraparound (e.g. 190 is 10 in reality)

  // This is our main score, weighting the difference of glass and lens on all parameters
  return sphereDiff + cylinderDiff + addDiff * 0.1 + axisDiff / 3600
}

function applyMutuallyExclusiveRules(score: number, rx: Eye, lens: Eye): number {
  // Those 3 rules are applied mutually exclusive in order (i.e. as soon as one applies, the others aren't applied). Why? No one knows.
  // But otherwise we could have scores below zero, so maybe bc of that?
  let diff = 0

  diff = sphericalEquivalentScore(rx.sphere, lens.sphere, rx.cylinder, lens.cylinder)
  if (diff !== 0) return diff

  diff = contraryDiffsScore(rx.sphere, lens.sphere, rx.cylinder, lens.cylinder)
  if (diff !== 0) return diff

  diff = equalSphereAndSmallCylinderScore(rx.sphere, lens.sphere, rx.cylinder, lens.cylinder)
  if (diff !== 0) return diff

  return 0
}

function smallerLensSphereScore(rxSphere: number, lensSphere: number): number {
  if (rxSphere > lensSphere && rxSphere > 0) {
    // ADDING to the score, so it seems to be bad if that is the case
    return +0.25
  }
  return 0
}

function equalSphereAndSmallCylinderScore(
  rxSphere: number,
  lensSphere: number,
  rxCylinder: number,
  lensCylinder: number,
): number {
  /**
   * If sphere matches and the cylinder difference is small, substract an additonal amount
   * because this makes the glasses near perfect even though they have a difference in cylinder
   */
  const cylinderDiff = Math.abs(lensCylinder - rxCylinder)
  if (rxSphere === lensSphere && cylinderDiff !== 0 && cylinderDiff <= 0.75) {
    return -0.12
  }
  return 0
}

function contraryDiffsScore(
  rxSphere: number,
  lensSphere: number,
  rxCylinder: number,
  lensCylinder: number,
): number {
  /**
   * If either cylinders are too small AND spheres are too big; or the other way round, improve the score by subtracting a bit
   */
  const sphereDiff = Math.abs(lensSphere - rxSphere)
  const cylinderDiff = Math.abs(lensCylinder - rxCylinder)
  if (
    (lensSphere > rxSphere && rxCylinder > lensCylinder) ||
    (lensSphere < rxSphere && rxCylinder < lensCylinder)
  ) {
    // Subtract based on how big the difference is
    if (cylinderDiff < 0.5) {
      // should be the same as cylinderDiff === 0.25 (not 0 though!)
      // Subtract a bit more when sphere and cylinder have exactly the same difference
      return sphereDiff === cylinderDiff ? -0.3 : -0.25
    } else {
      // TODO For some reason, we subtract more when the cylinder difference is higher
      // => maybe so we don't go below zero? in that case it would probably make more sense to make this dynamically in the future
      return sphereDiff === cylinderDiff ? -0.55 : -0.5
    }
  }
  return 0
}

function sphericalEquivalentScore(
  rxSphere: number,
  lensSphere: number,
  rxCylinder: number,
  lensCylinder: number,
): number {
  /**
   * Account for the fact that one can transform glasses based on sphere+cylinder
   * adding a value to Rx cylinder and subtracting half of that value from the Rx sphere, will give you roughly the same Rx. (hint: cyl > 0 is not a valid input)
   */
  const cylinderDiff = Math.abs(lensCylinder - rxCylinder)
  if (
    rxSphere - lensSphere === (lensCylinder - rxCylinder) / 2 &&
    rxSphere > lensSphere && // this is relevant so the spherical equivalent of lens (other way round) does not return a score?
    cylinderDiff <= 1
  ) {
    return lensSphere > 0 ? -0.55 : -0.5
  }
  return 0
}

function multiFocalAddScore(rxAdd: number | undefined, lensAdd: number | undefined): number {
  if (rxAdd == null || lensAdd == null) return 0
  if (lensAdd > rxAdd) {
    return -(lensAdd - rxAdd) / 100
  }
  return 0
}

function calcSphericalEquivalents(
  rxSphere: number,
  rxCylinder: number,
): { sphere: number; cylinder: number }[] {
  /**
   * Calculates all spherical equivalents for provided rxSphere and rxCylinder.
   * Returns those, including the original rxSphere+rxCylinder
   */
  const equivalents = [{ sphere: rxSphere, cylinder: rxCylinder }]
  if (rxCylinder <= -0.5) equivalents.push({ sphere: rxSphere - 0.25, cylinder: rxCylinder + 0.5 })
  if (rxCylinder <= -1) equivalents.push({ sphere: rxSphere - 0.5, cylinder: rxCylinder + 1 })
  if (rxCylinder <= -1.5) equivalents.push({ sphere: rxSphere - 0.75, cylinder: rxCylinder + 1.5 })
  return equivalents
}
