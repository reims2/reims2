import { sanitizeEyeValues, propsAsNumber } from '~/lib/util'
import { Glasses } from '~/model/GlassesModel'

// glasses with a philscore higher than this will be removed
const PHILSCORE_CUT_OFF = 4

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateAllPhilscore(terms:any, glasses: Glasses[]):Glasses[] {
  const rxOd = sanitizeEyeValues(terms.od)
  const rxOs = sanitizeEyeValues(terms.os)

  return glasses.slice()
    .filter(glass => (terms.glassesType === glass.glassesType))
    .filter(glass => checkForAxisTolerance(rxOd, propsAsNumber(glass.od)) && checkForAxisTolerance(rxOs, propsAsNumber(glass.os)))
    .filter(glass => glass.glassesType === 'single' || (Math.abs(glass.od.add - rxOd.add) <= 0.5 && Math.abs(glass.os.add - rxOs.add) <= 0.5))
    .map((glass) => {
      const odScore = calcSingleEyePhilscore(rxOd, propsAsNumber(glass.od), terms.glassesType)
      const osScore = calcSingleEyePhilscore(rxOs, propsAsNumber(glass.os), terms.glassesType)

      return { ...glass, score: (odScore + osScore), odScore, osScore }
    })
    .filter(glass => glass.score <= PHILSCORE_CUT_OFF)
    .sort((a, b) => (a.score > b.score ? 1 : -1))
}

function checkForAxisTolerance(rx:Record<string, number>, lens: Record<string, number>):boolean {
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

function calcSingleEyePhilscore(rx:Record<string, number>, lens: Record<string, number>, glassesType: string):number {
  const sphereDiff = Math.abs(lens.sphere - rx.sphere)
  const cylinderDiff = Math.abs(lens.cylinder - rx.cylinder)
  const addDiff = glassesType === 'single' ? 0 : Math.abs(lens.add - rx.add)

  let axisDiff = Math.abs(lens.axis - rx.axis)
  axisDiff = (axisDiff > 90 ? 180 - axisDiff : axisDiff) // account for wraparound (e.g. 190 is 10 in reality)

  // This is our main score, weighting the difference of glass and lens on all parameters
  const initScore = sphereDiff + cylinderDiff + addDiff * 0.09 + axisDiff / 3600
  let score = initScore

  /* In the following that score gets improved (=smaller) or worse (=bigger) based on a few rules to account for some optometry special cases */

  if (rx.sphere > lens.sphere && rx.sphere > 0) {
    // ADDING to the score, so it seems to be bad if that is the case
    score += 0.25
  }

  const subtractScore = (score:number, change:number) => ((score - change) < 0 ? score : (score - change))

  // Account for the fact that one can transform glasses based on sphere+cylinder
  // adding a value to Rx cylinder and subtracting half of that value from the Rx sphere, will give you roughly the same Rx. (but remember cyl > 0 not possible)
  let diff = 0
  if ((rx.sphere - lens.sphere) === (lens.cylinder - rx.cylinder) / 2 &&
          // rx.sphere > lens.sphere && // fixme this is in the PDF but removing it gives better results
          glassesType === 'single' && // fixme this doesn't make sense and isn't in the PDF, but gives better results
          cylinderDiff < 1) {
    diff = (lens.sphere > 0) ? 0.55 : 0.5
  }
  score = subtractScore(score, diff)

  // If either both sphere and cylinder are too small OR both sphere and cylinder are too big, improve the score by subtracting a bit
  diff = 0
  if ((lens.sphere > rx.sphere && rx.cylinder > lens.cylinder) || (lens.sphere < rx.sphere && rx.cylinder < lens.cylinder)) {
    // Subtract based on how big the difference is
    if (cylinderDiff < 0.5) { // should be the same as cylinderDiff === 0.25 (not 0 though!)
      // Subtract a bit more when sphere and cylinder have exactly the same difference
      diff = (sphereDiff === cylinderDiff) ? 0.3 : 0.25
    } else {
      // fixme For some reason, we subtract more when the cylinder difference is higher. this doesn't make sense => maybe so we don't go below zero?
      diff = (sphereDiff === cylinderDiff) ? 0.55 : 0.5
    }
  }
  score = subtractScore(score, diff)

  // If sphere matches and the cylinder difference is small, substract an additonal amount
  // because this makes the glasses near perfect even though they have a difference in cylinder
  diff = 0
  if (rx.sphere === lens.sphere && cylinderDiff > 0 && cylinderDiff <= 0.75) {
    // && glassesType === 'single' // fixme this condition is valid according to pdf, but isn't in reality
    diff = 0.12
  }
  score = subtractScore(score, diff)

  /* fixme removing this doesn't make a big difference, but gives slightly better results. not sure why this was in the PDF
    diff = 0
    if (glassesType === 'multifocal' && lens.axis > rx.axis) {
      // but why do this at all? this doesn't make sense because a higher difference should be punished, not encouraged?
      diff = (lens.axis - rx.axis) / 1000
    }
    score = subtractScore(score, diff) */

  return score
}
