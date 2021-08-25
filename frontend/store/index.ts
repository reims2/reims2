import type { MutationTree, ActionTree } from 'vuex'
export interface RootState {
  allGlasses: any[],
  lastRefresh: Date | null,
  location: string
}
export const state = (): RootState => ({
  allGlasses: [],
  lastRefresh: null,
  location: 'sa'
})

export const MutationType = {
  SET_GLASSES: 'setGlasses',
  SET_LOCATION: 'setLocation',
  SET_LAST_REFRESH: 'setLastRefresh'
}
export const mutations: MutationTree<RootState> = {
  [MutationType.SET_GLASSES]: (state, value: any[]) => { state.allGlasses = value },
  [MutationType.SET_LOCATION]: (state, value: string) => { state.location = value },
  [MutationType.SET_LAST_REFRESH]: (state, value: Date) => { state.lastRefresh = value }
}

export const ActionType = {
  PHIL_SCORE: 'philScore',
  LOAD_GLASSES: 'loadGlasses',
  ADD_GLASSES: 'addGlasses',
  DISPENSE_GLASSES: 'dispense',
  DELETE_GLASSES: 'delete'
}
export const actions: ActionTree<RootState, RootState> = {

  async [ActionType.LOAD_GLASSES]({ commit, state }) {
    const data = await this.$axios.$get(`/api/glasses/${state.location}`, { params: { size: 100000 } }) as any // fixme ts
    commit(MutationType.SET_GLASSES, data.glasses)
    commit(MutationType.SET_LAST_REFRESH, new Date())
  }

}
