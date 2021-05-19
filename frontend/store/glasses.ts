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
  glasses: any[],
  matches: any[],
  lastAdded: any[]
}
export const state = (): GlassesSatate => ({
  glasses: [],
  matches: [],
  lastAdded: []
})

export const MutationType = {
  SET_GLASSES: 'setGlasses',
  SET_MATCHES: 'setMatches',
  APPEND_LAST_ADDED: 'appendLastAdded'
}
export const mutations: MutationTree<GlassesSatate> = {
  [MutationType.SET_GLASSES]: (state, value: any[]) => { state.glasses = value },
  [MutationType.SET_MATCHES]: (state, value: any[]) => { state.matches = value },
  [MutationType.APPEND_LAST_ADDED]: (state, value: any) => { state.lastAdded.unshift(value) }
}

export const ActionType = {
  PHIL_SCORE: 'philScore',
  LOAD_ACTIVE_GLASSES: 'loadActiveGlasses',
  ADD_GLASSES: 'addGlasses'
}
export const actions: ActionTree<GlassesSatate, GlassesSatate> = {
  [ActionType.PHIL_SCORE]({ commit, state }, eyeModel) {
    commit(MutationType.SET_MATCHES, calculatePhilscore(eyeModel, state.glasses))
  },

  async [ActionType.LOAD_ACTIVE_GLASSES]({ commit, rootState }) {
    const data = await this.$axios.$get('/glasses') // fixme ts
    let selectedGlasses
    if ((rootState as any).location === 'sa') selectedGlasses = data.filter((el: { sku: any }) => Number(el.sku) < 5000)
    else selectedGlasses = data.filter((el: { sku: any }) => Number(el.sku) >= 5000)
    commit(MutationType.SET_GLASSES, selectedGlasses)
  },

  async [ActionType.ADD_GLASSES]({ commit }, newGlasses:any) {
    await this.$axios.$post('/glasses', newGlasses) // fixme ts
    commit(MutationType.APPEND_LAST_ADDED, newGlasses)
  }
}
