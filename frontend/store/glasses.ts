import type { ActionTree, MutationTree } from 'vuex'
import { RootState } from '.'

export interface GlassesSatate {
  lastAdded: any[]
}
export const state = (): GlassesSatate => ({
  lastAdded: []
})

export const MutationType = {
  SET_GLASSES: 'setGlasses',
  APPEND_LAST_ADDED: 'appendLastAdded',
  REMOVE_FROM_LAST_ADDED: 'removeFromLastAdded'
}
export const mutations: MutationTree<GlassesSatate> = {
  [MutationType.APPEND_LAST_ADDED]: (state, value: any) => { state.lastAdded.unshift(value) },
  [MutationType.REMOVE_FROM_LAST_ADDED]: (state, skuToRemove: number) => {
    // eslint-disable-next-line eqeqeq
    state.lastAdded = state.lastAdded.filter(itm => itm.sku != skuToRemove)
  }
}

export const ActionType = {
  ADD_GLASSES: 'addGlasses',
  DISPENSE_GLASSES: 'dispense',
  DELETE_GLASSES: 'delete'
}
export const actions: ActionTree<GlassesSatate, RootState> = {
  async [ActionType.ADD_GLASSES]({ commit, rootState }, newGlasses:any) {
    const request = Object.assign({}, newGlasses)
    request.location = rootState.location
    const data = await this.$axios.$post('/api/glasses', request)
    commit(MutationType.APPEND_LAST_ADDED, data)
  },

  async [ActionType.DISPENSE_GLASSES]({ rootState }, sku: any) {
    await this.$axios.$put(`/api/glasses/dispense/${rootState.location}/${sku}`, { dispensed: true })
  },

  async [ActionType.DELETE_GLASSES]({ rootState }, sku: any) {
    await this.$axios.$delete(`/api/glasses/${rootState.location}/${sku}`)
  }
}
