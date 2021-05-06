import type { ActionTree, MutationTree } from 'vuex'

import GLASSES from '~/assets/out.json'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculatePhilscore(eyeModel:any, glasses: any[]):any[] {
  // This is just for testing and makes no pratical sense
  if (eyeModel.type) {
    return glasses.slice()
      .sort(() => 0.5 - Math.random()).slice(0, 6)
      .map(obj => ({ ...obj, score: Math.round(Math.random() * 1000) / 1000 }))
      .sort((a, b) => (a.score > b.score ? 1 : -1))
  }
  return []
}

export interface GlassesSatate {
  glasses: any[],
  matches: any[]
}
export const state = (): GlassesSatate => ({
  glasses: [],
  matches: []
})

export const MutationType = {
  SET_GLASSES: 'setGlasses',
  SET_MATCHES: 'setMatches'
}
export const mutations: MutationTree<GlassesSatate> = {
  [MutationType.SET_GLASSES]: (state, value: any[]) => { state.glasses = value },
  [MutationType.SET_MATCHES]: (state, value: any[]) => { state.matches = value }
}

export const ActionType = {
  PHIL_SCORE: 'philScore',
  LOAD_ACTIVE_GLASSES: 'loadActiveGlasses'
}
export const actions: ActionTree<GlassesSatate, GlassesSatate> = {
  [ActionType.PHIL_SCORE]({ commit, state }, eyeModel) {
    commit(MutationType.SET_MATCHES, calculatePhilscore(eyeModel, state.glasses))
  },

  [ActionType.LOAD_ACTIVE_GLASSES]({ commit }) {
    commit(MutationType.SET_GLASSES, GLASSES)
  }
}
