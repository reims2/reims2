import type { ActionTree, MutationTree } from 'vuex'
import { RootState } from '.'

export interface TableState {
}
export const state = (): TableState => ({
})

export const MutationType = {
}
export const mutations: MutationTree<TableState> = {
}

export const ActionType = {
  LOAD_ITEMS: 'loadItems'
}
export const actions: ActionTree<TableState, RootState> = {

  async [ActionType.LOAD_ITEMS]({ commit, rootState }, options:any) {
    const sortString = options.sortBy[0] + ',' + (options.sortDesc[0] ? 'desc' : 'asc')
    const data = await this.$axios.$get(`/api/glasses/${rootState.location}`, { params: { size: options.itemsPerPage, page: options.page - 1, sort: sortString } })
    commit('setGlassesCount', data.totalItems, { root: true })
    return data.glasses
  }
}
