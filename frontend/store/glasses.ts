import type { GetterTree } from 'vuex'

import GLASSES from '~/assets/out.json';

export function calculatePhilscore(eye_mode:any, state_glasses: any[]):string {
  return ''
}

export interface RootState {
  glasses: any[]
}

export const state = (): RootState => ({
  glasses: GLASSES
})

export const getters: GetterTree<RootState, RootState> = {
  philScore: (state, eye_model: any):string => {
    return calculatePhilscore(eye_model, state.glasses)
  }
}
