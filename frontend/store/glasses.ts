import type { ActionTree, MutationTree } from 'vuex'

// import GLASSES from '~/assets/out.json'

function propsAsNumber(obj:any):Record<string, number> {
  const temp = JSON.parse(JSON.stringify(obj))
  Object.keys(temp).forEach((k) => { temp[k] = Number(temp[k]) })
  return temp
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateAllPhilscore(terms:any, glasses: any[]):any[] {
  // This is just for testing and makes no pratical sense
  if (terms.glassesType) { // fixme
    return glasses.slice()
      .filter(val => (val.glassesType === 'single' ? terms.glassesType === val.glassesType : terms.glassesType !== 'single'))
      .map((glass) => {
        const odScore = calcSingleEyePhilscore(propsAsNumber(terms.od), propsAsNumber(glass.od), terms.glassesType)
        const osScore = calcSingleEyePhilscore(propsAsNumber(terms.os), propsAsNumber(glass.os), terms.glassesType)

        return { ...glass, score: (odScore + osScore) }
      })
      .sort((a, b) => (a.score > b.score ? 1 : -1))
  }
  return []
}

function calcSingleEyePhilscore(rx:Record<string, number>, lens: Record<string, number>, glassesType: string):number {
  // unsigned difference between lens and prescription sphere
  const sphereDiff = Math.abs(lens.sphere - rx.sphere)
  // unsigned difference between lens and prescription cylinder
  const cylinderDiff = Math.abs(lens.cylinder - rx.cylinder)
  // If the prescription is a bifocal, one-tenth the unsigned difference between lens and prescription added strength
  const addDiff = glassesType === 'single' ? 0 : Math.abs(lens.add - rx.add)

  // if the unsigned difference between lens and prescription is over 90, 180 minus that difference, divided by 3600
  // else if the unsigned difference between lens and prescription less than or equal to 90, that difference divided by 3600
  const axisDiff = Math.abs(lens.axis - rx.axis)
  const axisDiffNormalized = (axisDiff > 90 ? 180 - axisDiff : axisDiff)

  let score = sphereDiff + cylinderDiff + addDiff / 10 + axisDiffNormalized / 3600

  if ((rx.sphere - lens.sphere) === (lens.cylinder - rx.cylinder) / 2 &&
        rx.sphere > lens.sphere &&
        cylinderDiff < 1) {
    score -= (lens.sphere > 0) ? 0.55 : 0.5
  }

  if (rx.sphere === lens.sphere &&
        Math.abs(rx.rylinder - lens.cylinder) <= 0.75 &&
        lens.cylinder !== rx.cylinder) {
    score -= 0.12
  }

  if ((lens.sphere > rx.sphere && rx.cylinder > lens.cylinder) || (lens.sphere < rx.sphere && rx.cylinder < lens.cylinder)) {
    if (cylinderDiff < 0.5) {
      score -= (sphereDiff === cylinderDiff) ? 0.3 : 0.25
    } else {
      score -= (sphereDiff === cylinderDiff) ? (11 / 20) : 0.5
    }
  }

  if (glassesType === 'multi' && lens.axis > rx.axis) {
    // fixme use non normalized?
    score -= axisDiffNormalized / 100
  }

  if (rx.sphere > lens.sphere && rx.sphere > 0) {
    score += 0.25
  }

  return score
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
