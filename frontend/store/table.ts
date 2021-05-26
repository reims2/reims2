import type { ActionTree, MutationTree } from 'vuex'

export interface TableState {
  items: any[],
  totalItems: number
}
export const state = (): TableState => ({
  items: [],
  totalItems: 0
})

export const MutationType = {
  SET_ITEMS: 'setItems',
  SET_TOTAL_ITEMS: 'setTotalItems'
}
export const mutations: MutationTree<TableState> = {
  [MutationType.SET_ITEMS]: (state, value: any[]) => { state.items = value },
  [MutationType.SET_TOTAL_ITEMS]: (state, value: number) => { state.totalItems = value }
}

export const ActionType = {
  LOAD_ITEMS: 'loadItems',
  ADD_GLASSES: 'addGlasses'
}
export const actions: ActionTree<TableState, TableState> = {

  async [ActionType.LOAD_ITEMS]({ commit, rootState }, options:any) {
    const sortOption = options.sortBy[0]
    const sortString = sortOption + ',' + (options.sortDesc[0] ? 'desc' : 'asc')
    const data = await this.$axios.$get(`/api/glasses/${(rootState as any).location}`, { params: { size: options.itemsPerPage, page: options.page - 1, sort: sortString } }) as any // fixme ts, and the -1
    commit(MutationType.SET_ITEMS, data.glasses)
    commit(MutationType.SET_TOTAL_ITEMS, data.totalItems)
  }
}
