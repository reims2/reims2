import type { ActionTree, MutationTree } from 'vuex'

import GLASSES from '~/assets/out.json'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculatePhilscore(eyeModel:any, glasses: any[]):any[] {
  // This is just for testing and makes no pratical sense
  if (eyeModel.type) {
    return glasses.slice(0, 6).map(obj => ({ ...obj, score: Math.round(Math.random() * 1000) / 1000 }))
  }
  return []
}

export interface GlassesSatate {
  glasses: any[],
  matches: any[]
}
export const state = (): GlassesSatate => ({
  glasses: GLASSES,
  matches: []
})

export const MutationType = {
  SET_MATCHES: 'setMatches'
}
export const mutations: MutationTree<GlassesSatate> = {
  [MutationType.SET_MATCHES]: (state, value: any[]) => { state.matches = value }
}

export const ActionType = {
  PHIL_SCORE: 'philScore'
}
export const actions: ActionTree<GlassesSatate, GlassesSatate> = {
  [ActionType.PHIL_SCORE]({ commit, state }, eyeModel) {
    commit(MutationType.SET_MATCHES, calculatePhilscore(eyeModel, state.glasses))
  }
}
