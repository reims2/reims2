import { sanitizeEyeValues } from './util'
import { Glasses, Eye, GlassesSearch } from '~/model/GlassesModel'

// glasses with a philscore higher than this will be removed
const PHILSCORE_CUT_OFF = 4
// Glasses with a sphere/cylinder/additional delta of more than this will be removed
const SPHERE_TOLERANCE = 2
const CYLINDER_TOLERANCE = 2
const ADDITIONAL_TOLERANCE = 0.5

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function calculateAllPhilscore(terms:GlassesSearch, glasses: Glasses[]):Glasses[] {
  const rxOd = sanitizeEyeValues(terms.od)
  const rxOs = sanitizeEyeValues(terms.os)

  return glasses.slice()
    .filter(glass => (terms.glassesType === glass.glassesType))
    .filter(glass => checkForSingleAxisTolerance(rxOd, glass.od) && checkForSingleAxisTolerance(rxOs, glass.os))
    .filter(glass => checkForSphereTolerance(glass, rxOd, rxOs))
    .filter(glass => checkForCylinderTolerance(glass, rxOd, rxOs))
    .filter(glass => glass.glassesType === 'single' || checkForAdditionalTolerance(glass, rxOd, rxOs))
    .map((glass) => {
      const odScore = calcSingleEyePhilscore(rxOd, glass.od, terms.glassesType === 'single')
      const osScore = calcSingleEyePhilscore(rxOs, glass.os, terms.glassesType === 'single')

      return { ...glass, score: (odScore + osScore), odScore, osScore }
    })
    .filter(glass => glass.score <= PHILSCORE_CUT_OFF)
    .sort((a, b) => (a.score > b.score ? 1 : -1))
}

function checkForSingleAxisTolerance(rx:Eye, lens: Eye):boolean {
  /* The AtoLTF Test: We filter out all glasses that have a too big axis difference */
  // Some arbitrary numbers from the PDF, in short: Smaller cylinders allow for a greater tolerance.
  const toleranceYValues = [7, 8, 9, 10, 13, 15, 20, 25, 35, 90]
  const toleranceXValues = [-4, -3, -2, -1.75, -1.25, -1, -0.75, -0.5, -0.25, 0]
  // Implement simple "lookup table"
  let selectedTolerance = toleranceYValues[0]
  for (let i = 0; i < toleranceXValues.length; i++) {
    if (lens.cylinder < toleranceXValues[i]) break
    selectedTolerance = toleranceYValues[i]
  }

  // Now calculate the minima and maxima. We have two pairs of min and max because we have to account for "wraparound"
  // An axis of 0 with a tolerance of plus and minus 10, has to be between 170-180 and 0-10, because 180 wraps around to 0.
  // This is all we do here really
  const axisSub = rx.axis - selectedTolerance
  const axisAdd = rx.axis + selectedTolerance

  const minimum1 = (axisAdd > 180 || axisSub < 0) ? 0 : axisSub
  const maximum1 = axisAdd > 180 ? axisAdd - 180 : axisAdd

  let minimum2 = (axisAdd > 180 || axisSub < 0) ? axisSub : 0
  if (axisSub < 0) minimum2 += 180

  const maximum2 = (axisAdd > 180 || axisSub < 0) ? 180 : 0

  // Now return true if the lens axis lays inbetween one of the two min-max pairs
  return (lens.axis >= minimum1 && lens.axis <= maximum1) || (lens.axis >= minimum2 && lens.axis <= maximum2)
}

function checkForSphereTolerance(glass: Glasses, rxOd:Eye, rxOs: Eye):boolean {
  return Math.abs(glass.od.sphere - rxOd.sphere) <= SPHERE_TOLERANCE && Math.abs(glass.os.sphere - rxOs.sphere) <= SPHERE_TOLERANCE
}

function checkForCylinderTolerance(glass: Glasses, rxOd:Eye, rxOs: Eye):boolean {
  return Math.abs(glass.od.cylinder - rxOd.cylinder) <= CYLINDER_TOLERANCE && Math.abs(glass.os.cylinder - rxOs.cylinder) <= CYLINDER_TOLERANCE
}

function checkForAdditionalTolerance(glass: Glasses, rxOd:Eye, rxOs: Eye):boolean {
  return (Math.abs(glass.od.add!! - rxOd.add!!) <= ADDITIONAL_TOLERANCE && Math.abs(glass.os.add!! - rxOs.add!!) <= ADDITIONAL_TOLERANCE)
}

function calcSingleEyePhilscore(rx:Eye, lens: Eye, isSinglefocal: boolean):number {
  /**
   * rx: desired values for a single eye
   * lens: single eye of one available glasses
   * glassesType: single or multifocal
   */
  const sphereDiff = Math.abs(lens.sphere - rx.sphere)
  const cylinderDiff = Math.abs(lens.cylinder - rx.cylinder)
  const addDiff = isSinglefocal ? 0 : Math.abs(lens.add!! - rx.add!!)

  let axisDiff = Math.abs(lens.axis - rx.axis)
  axisDiff = (axisDiff > 90 ? 180 - axisDiff : axisDiff) // account for wraparound (e.g. 190 is 10 in reality)

  // This is our main score, weighting the difference of glass and lens on all parameters
  const initScore = sphereDiff + cylinderDiff + addDiff * 0.09 + axisDiff / 3600
  let score = initScore

  // special function that adds two numbers as long as the results stays positive
  const changeScore = (score:number, change:number) => ((score + change) < 0 ? score : (score + change))

  /* In the following that score gets improved (=smaller) or worse (=bigger) based on a few rules to account for some optometry special cases */

  let diff = smallerLensSphereScore(rx.sphere, lens.sphere)
  score = changeScore(score, diff)

  diff = sphericalEquivalentScore(rx.sphere, rx.cylinder, lens.sphere, lens.cylinder, isSinglefocal)
  score = changeScore(score, diff)

  diff = contraryDiffsScore(rx.sphere, lens.sphere, rx.cylinder, lens.cylinder)
  score = changeScore(score, diff)

  diff = equalSphereAndSmallCylinderScore(rx.sphere, lens.sphere, cylinderDiff)
  score = changeScore(score, diff)

  return score
}

export function smallerLensSphereScore(rxSphere :number, lensSphere:number) : number {
  if (rxSphere > lensSphere && rxSphere > 0) {
    // ADDING to the score, so it seems to be bad if that is the case
    return +0.25
  }
  return 0
}

export function equalSphereAndSmallCylinderScore(rxSphere: number, lensSphere: number, cylinderDiff: number): number {
  /**
   * If sphere matches and the cylinder difference is small, substract an additonal amount
   * because this makes the glasses near perfect even though they have a difference in cylinder
   */
  if (rxSphere === lensSphere && cylinderDiff > 0 && cylinderDiff <= 0.75) {
    // && glassesType === 'single' // fixme this condition is valid according to pdf, but isn't in reality
    return -0.12
  }
  return 0
}

export function contraryDiffsScore(rxSphere: number, lensSphere: number, rxCylinder: number, lensCylinder: number): number {
  /**
   * If either cylinders are too small AND spheres are too big; or the other way round, improve the score by subtracting a bit
   */
  const sphereDiff = Math.abs(lensSphere - rxSphere)
  const cylinderDiff = Math.abs(lensCylinder - rxCylinder)
  if ((lensSphere > rxSphere && rxCylinder > lensCylinder) || (lensSphere < rxSphere && rxCylinder < lensCylinder)) {
    // Subtract based on how big the difference is
    if (cylinderDiff < 0.5) { // should be the same as cylinderDiff === 0.25 (not 0 though!)
      // Subtract a bit more when sphere and cylinder have exactly the same difference
      return (sphereDiff === cylinderDiff) ? -0.3 : -0.25
    } else {
      // fixme For some reason, we subtract more when the cylinder difference is higher
      // => maybe so we don't go below zero? in that case it would probably make more sense to make this dynamically in the future
      return (sphereDiff === cylinderDiff) ? -0.55 : -0.5
    }
  }
  return 0
}

export function sphericalEquivalentScore(rxSphere: number, lensSphere: number, rxCylinder: number, lensCylinder: number, isSinglefocal: boolean): number {
  /**
   * Account for the fact that one can transform glasses based on sphere+cylinder
   * adding a value to Rx cylinder and subtracting half of that value from the Rx sphere, will give you roughly the same Rx. (but remember cyl > 0 not possible)
   */
  const cylinderDiff = Math.abs(lensCylinder - rxCylinder)
  if ((rxSphere - lensSphere) === (lensCylinder - rxCylinder) / 2 &&
    // rxSphere > lensSphere && // fixme this is in the PDF but removing it gives better results
    isSinglefocal && // fixme this doesn't make sense and isn't in the PDF, but gives better results
    cylinderDiff < 1) {
    return (lensSphere > 0) ? -0.55 : -0.5
  }
  return 0
}

// function multiFocalAxisScore(rxAxis: number, lensAxis:number, isMultifocal: boolean): number {
//   /**
//    * DEPRECATED: This function was in the original PDF, but removing it gave better results, so this is unused. For reference only
//    * It anyway only made it pretty small difference since we divide by 1000
//    */
//   if (isMultifocal && lensAxis > rxAxis) {
//     // but why do this at all? this doesn't make sense because a higher difference should be punished, not encouraged?
//     return -(lensAxis - rxAxis) / 1000
//   }
//   return 0
// }
