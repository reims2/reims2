import type { ActionTree, MutationTree } from 'vuex'

import GLASSES from '~/assets/out.json';

export function calculatePhilscore(eyeModel:any, glasses: any[]):string {
  // This is just for testing and makes no pratical sense
  return eyeModel ? JSON.stringify(glasses[0]) : ''
}

export interface GlassesSatate {
  glasses: any[],
  matches: string
}
export const state = (): GlassesSatate => ({
  glasses: GLASSES,
  matches: ''
})

export const MutationType = {
  SET_MATCHES: 'setMatches'
}
export const mutations: MutationTree<GlassesSatate> = {
  [MutationType.SET_MATCHES]: (state, value: string) => { state.matches = value }
}

export const ActionType = {
  PHIL_SCORE: 'philScore'
}
export const actions: ActionTree<GlassesSatate, GlassesSatate> = {
  [ActionType.PHIL_SCORE]({ commit, state }, eyeModel) {
    commit(MutationType.SET_MATCHES, calculatePhilscore(eyeModel, state.glasses))
  }
}
