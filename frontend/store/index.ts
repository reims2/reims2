import type { MutationTree, ActionTree } from 'vuex'
import { Glasses } from '~/model/GlassesModel'
export interface RootState {
  allGlasses: Glasses[],
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
  SET_LAST_REFRESH: 'setLastRefresh',
  DELETE_OFFLINE_GLASSES: 'deleteOfflineGlasses',
  ADD_OFFLINE_GLASSES: 'addOfflineGlasses'
}
export const mutations: MutationTree<RootState> = {
  [MutationType.SET_GLASSES]: (state, value: Glasses[]) => { state.allGlasses = value },
  [MutationType.SET_LOCATION]: (state, value: string) => { state.location = value },
  [MutationType.SET_LAST_REFRESH]: (state, value: Date) => { state.lastRefresh = value },
  [MutationType.DELETE_OFFLINE_GLASSES]: (state, sku: Number) => {
    // todo error handling if glasses do not contain SKU
    state.allGlasses = state.allGlasses.filter(el => el.sku !== sku)
  },
  [MutationType.ADD_OFFLINE_GLASSES]: (state, glasses: Glasses) => { state.allGlasses.push(glasses) }
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
