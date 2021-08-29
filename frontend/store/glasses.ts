import type { ActionTree, MutationTree } from 'vuex'
import { RootState } from '.'
import { MutationType as IndexMutationType } from './index'
import { Glasses } from '~/model/GlassesModel'

export interface GlassesSatate {
  lastAdded: Glasses[]
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
  [MutationType.APPEND_LAST_ADDED]: (state, value: Glasses) => { state.lastAdded.unshift(value) },
  [MutationType.REMOVE_FROM_LAST_ADDED]: (state, skuToRemove: number) => {
    // eslint-disable-next-line eqeqeq
    state.lastAdded = state.lastAdded.filter(itm => itm.sku != skuToRemove)
  }
}

export const ActionType = {
  ADD_GLASSES: 'addGlasses',
  FETCH_SINGLE_GLASSES: 'fetchSingle',
  DISPENSE_GLASSES: 'dispense',
  DELETE_GLASSES: 'delete'
}
export const actions: ActionTree<GlassesSatate, RootState> = {
  async [ActionType.ADD_GLASSES]({ commit, rootState }, newGlasses:Glasses) {
    const request = Object.assign({}, newGlasses)
    request.location = rootState.location
    const data = await this.$axios.$post('/api/glasses', request)
    commit(MutationType.APPEND_LAST_ADDED, data)
    commit(IndexMutationType.ADD_OFFLINE_GLASSES, data, { root: true })
  },

  async [ActionType.FETCH_SINGLE_GLASSES]({ commit, rootState }, sku: number) {
    const data = await this.$axios.$get(`/api/glasses/${rootState.location}/${sku}`)
    commit(IndexMutationType.DELETE_OFFLINE_GLASSES, sku, { root: true })
    commit(IndexMutationType.ADD_OFFLINE_GLASSES, data, { root: true })
    return data
  },

  async [ActionType.DISPENSE_GLASSES]({ commit, rootState }, sku: number) {
    await this.$axios.$put(`/api/glasses/dispense/${rootState.location}/${sku}`, { dispensed: true })
    commit(IndexMutationType.DELETE_OFFLINE_GLASSES, sku, { root: true })
  },

  async [ActionType.DELETE_GLASSES]({ commit, rootState }, sku: number) {
    await this.$axios.$delete(`/api/glasses/${rootState.location}/${sku}`)
    commit(IndexMutationType.DELETE_OFFLINE_GLASSES, sku, { root: true })
  }
}
