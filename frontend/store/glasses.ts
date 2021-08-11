import type { ActionTree, MutationTree } from 'vuex'

// import GLASSES from '~/assets/out.json'

function propsAsNumber(obj:any):Record<string, number> {
  const temp = JSON.parse(JSON.stringify(obj))
  Object.keys(temp).forEach((k) => { temp[k] = Number(temp[k]) })
  return temp
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateAllPhilscore(terms:any, glasses: any[]):any[] {
  const rxOd = propsAsNumber(terms.od)
  const rxOs = propsAsNumber(terms.os)
  if (!terms.glassesType) { // fixme workaround so search doesn't start when search terms are empty
    return []
  }
  return glasses.slice()
    .filter(glass => (glass.glassesType === 'single' ? terms.glassesType === glass.glassesType : terms.glassesType !== 'single'))
    .filter(glass => checkForAxisTolerance(rxOd, propsAsNumber(glass.od)) && checkForAxisTolerance(rxOs, propsAsNumber(glass.os)))
    .map((glass) => {
      const odScore = calcSingleEyePhilscore(rxOd, propsAsNumber(glass.od), terms.glassesType)
      const osScore = calcSingleEyePhilscore(rxOs, propsAsNumber(glass.os), terms.glassesType)

      return { ...glass, score: (odScore + osScore), odScore, osScore }
    })
    .filter(glass => glass.score <= 3)
    .sort((a, b) => (a.score > b.score ? 1 : -1))
}

function checkForAxisTolerance(rx:Record<string, number>, lens: Record<string, number>):boolean {
  /* The AtoLTF Test: We filter out all glasses that have a too big axis difference */
  // Some arbitrary numbers from the paper, in short: Smaller cylinders allow for a greater tolerance.
  const toleranceYValues = [7, 8, 9, 10, 13, 15, 20, 25, 35, 90]
  const toleranceXValues = [-4, -3, -2, -1.75, -1.25, -1, -0.75, -0.5, -0.25, 0]
  // Implement simple "lookup table"
  let selectedTolerance = toleranceYValues[0]
  for (let i = 0; i < toleranceXValues.length; i++) {
    if (lens.cylinder < toleranceXValues[i]) {
      break
    }
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

  const axisDiff = Math.abs(lens.axis - rx.axis)
  const axisDiffNormalized = (axisDiff > 90 ? 180 - axisDiff : axisDiff) // account for wraparound (e.g. 190 is 10 in reality)

  // This is our main score, weighting the difference of glass and lens on all parameters
  const initScore = sphereDiff + cylinderDiff + addDiff / 10 + axisDiffNormalized / 3600
  let score = initScore

  /* In the following that score gets improved (=smaller) or worse (=bigger) based on a few rules to account for some optometry special cases */

  // Account for the fact that one can transform glasses based on sphere+cylinder
  // adding a value to Rx cylinder and subtracting half of that value from the Rx sphere, will give you roughly the same Rx. (but remember cyl > 0 not possible)
  if ((rx.sphere - lens.sphere) === (lens.cylinder - rx.cylinder) / 2 &&
        // fixme rx.sphere > lens.sphere &&
        cylinderDiff < 1) {
    score -= (lens.sphere > 0) ? 0.55 : 0.5
  }

  // If sphere matches and the cylinder difference is small, substract an additonal amount
  // because this makes the glasses near perfect even though they have a difference in cylinder
  if (rx.sphere === lens.sphere && cylinderDiff > 0 && cylinderDiff <= 0.75) {
    score -= 0.12
  }

  // If either both sphere and cylinder are too small OR both sphere and cylinder are too big, improve the score by subtracting a bit
  if ((lens.sphere > rx.sphere && rx.cylinder > lens.cylinder) || (lens.sphere < rx.sphere && rx.cylinder < lens.cylinder)) {
    // Subtract based on how high the difference is
    // fixme without this next if it gives wrong Philscore, but it doesn't make sense to put it here!
    if (sphereDiff === cylinderDiff) {
      if (cylinderDiff < 0.5) {
      // Subtract a bit more when sphere and cylinder have exactly the same difference
        score -= (sphereDiff === cylinderDiff) ? 0.3 : 0.25
      } else {
      // fixme For some reason, we subtract more when the cylinder difference is higher. this doesn't make sense
        score -= (sphereDiff === cylinderDiff) ? 0.55 : 0.5
      }
    }
  }

  if (glassesType === 'multi' && lens.axis > rx.axis) {
    // fixme use NON normalized? i dont think so
    // but why do this at all? this doesn't make sense because a higher difference should be punished, not encouraged?
    score -= axisDiffNormalized / 100
  }

  if (rx.sphere > lens.sphere && rx.sphere > 0) {
    // ADDING to the score, so it seems to be bad if that is the case
    score += 0.25
  }

  return score >= 0 ? score : initScore
}

export interface GlassesSatate {
  allGlasses: any[],
  matches: any[],
  lastAdded: any[]
}
export const state = (): GlassesSatate => ({
  allGlasses: [],
  matches: [],
  lastAdded: []
})

export const MutationType = {
  SET_GLASSES: 'setGlasses',
  SET_MATCHES: 'setMatches',
  APPEND_LAST_ADDED: 'appendLastAdded'
}
export const mutations: MutationTree<GlassesSatate> = {
  [MutationType.SET_GLASSES]: (state, value: any[]) => { state.allGlasses = value },
  [MutationType.SET_MATCHES]: (state, value: any[]) => { state.matches = value },
  [MutationType.APPEND_LAST_ADDED]: (state, value: any) => { state.lastAdded.unshift(value) }
}

export const ActionType = {
  PHIL_SCORE: 'philScore',
  LOAD_ACTIVE_GLASSES: 'loadActiveGlasses',
  ADD_GLASSES: 'addGlasses',
  DISPENSE_GLASSES: 'dispense',
  DELETE_GLASSES: 'delete'
}
export const actions: ActionTree<GlassesSatate, GlassesSatate> = {
  [ActionType.PHIL_SCORE]({ commit, state }, eyeModel) {
    commit(MutationType.SET_MATCHES, calculateAllPhilscore(eyeModel, state.allGlasses))
  },

  async [ActionType.LOAD_ACTIVE_GLASSES]({ commit, rootState }) {
    const data = await this.$axios.$get(`/api/glasses/${(rootState as any).location}`, { params: { size: 1000000 } }) as any // fixme ts
    commit(MutationType.SET_GLASSES, data.glasses)
  },

  async [ActionType.ADD_GLASSES]({ commit, rootState }, newGlasses:any) {
    const request = Object.assign({}, newGlasses)
    request.location = (rootState as any).location
    await this.$axios.$post('/api/glasses', request)
    commit(MutationType.APPEND_LAST_ADDED, newGlasses)
  },

  async [ActionType.DISPENSE_GLASSES](_state, glassesId: any) {
    await this.$axios.$put(`/api/glasses/dispense/${glassesId}`, { dispensed: true })
  },

  async [ActionType.DELETE_GLASSES](_state, glassesId: any) {
    await this.$axios.$delete(`/api/glasses/${glassesId}`)
  }
}
