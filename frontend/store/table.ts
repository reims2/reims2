import type { ActionTree, MutationTree } from 'vuex'
import { RootState } from '.'
import { Glasses } from '~/model/GlassesModel'

export interface TableState {
  items: Glasses[],
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
  [MutationType.SET_ITEMS]: (state, value: Glasses[]) => { state.items = value },
  [MutationType.SET_TOTAL_ITEMS]: (state, value: number) => { state.totalItems = value }
}

export const ActionType = {
  LOAD_ITEMS: 'loadItems'
}
export const actions: ActionTree<TableState, RootState> = {

  async [ActionType.LOAD_ITEMS]({ commit, rootState }, options:any) {
    let sortOption = options.sortBy[0]
    sortOption = sortOption.replace(/^(os|od)/, '$&.') // encoded in backend as `os.sphere` instead of `ossphere` as used in frontend
    const sortString = sortOption + ',' + (options.sortDesc[0] ? 'desc' : 'asc')
    const data = await this.$axios.$get(`/api/glasses/${rootState.location}`, { params: { size: options.itemsPerPage, page: options.page - 1, sort: sortString } }) as any // fixme ts, and the -1
    commit(MutationType.SET_ITEMS, data.glasses)
    commit(MutationType.SET_TOTAL_ITEMS, data.totalItems)
  }
}
