import type { ActionTree, MutationTree } from 'vuex'

// import GLASSES from '~/assets/out.json'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculatePhilscore(eyeModel:any, glasses: any[]):any[] {
  // This is just for testing and makes no pratical sense
  if (eyeModel.glassesType) { // fixme
    return glasses.slice()
      .sort(() => 0.5 - Math.random()).slice(0, 10)
      .map(obj => ({ ...obj, score: Math.round(Math.random() * 1000) / 1000 }))
      .sort((a, b) => (a.score > b.score ? 1 : -1))
  }
  return []
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
    commit(MutationType.SET_MATCHES, calculatePhilscore(eyeModel, state.allGlasses))
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
