import type { MutationTree } from 'vuex'
export interface RootState {
  location: string
}
export const state = (): RootState => ({
  location: 'sa'
})

export const MutationType = {
  SET_LOCATION: 'setLocation',
  SET_MATCHES: 'setMatches'
}
export const mutations: MutationTree<RootState> = {
  [MutationType.SET_LOCATION]: (state, value: string) => { state.location = value }
}
