import type { ActionTree, MutationTree } from 'vuex'
import { RootState } from '.'

export interface TableState {
  totalGlassesCount: number
}
export const state = (): TableState => ({
  totalGlassesCount: 0
})

export const MutationType = {
  SET_GLASSES_COUNT: 'setGlassesCount'
}
export const mutations: MutationTree<TableState> = {
  [MutationType.SET_GLASSES_COUNT]: (state, value: number) => { state.totalGlassesCount = value }
}

export const ActionType = {
  LOAD_ITEMS: 'loadItems'
}
export const actions: ActionTree<TableState, RootState> = {

  async [ActionType.LOAD_ITEMS]({ commit, rootState }, { options, filterString }) {
    const sortString = options.sortBy[0] + ',' + (options.sortDesc[0] ? 'desc' : 'asc')
    const params:any = { size: options.itemsPerPage, page: options.page - 1, sort: sortString }
    if (filterString != null && filterString !== '') params.search = filterString
    const data = await this.$axios.$get(`/api/glasses/${rootState.location}`, { params })
    commit(MutationType.SET_GLASSES_COUNT, data.totalItems)
    return data.glasses
  }
}
