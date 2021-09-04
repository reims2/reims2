import type { ActionTree, MutationTree } from 'vuex'
import { RootState } from '.'
import { MutationType as IndexMutationType } from './index'
import { Glasses } from '~/model/GlassesModel'

export interface GlassesState {
}
export const state = (): GlassesState => ({
})

export const MutationType = {
}
export const mutations: MutationTree<GlassesState> = {
}

export const ActionType = {
  ADD_GLASSES: 'addGlasses',
  FETCH_SINGLE_GLASSES: 'fetchSingle',
  DISPENSE_GLASSES: 'dispense',
  UNDISPENSE_GLASSES: 'undispense',
  DELETE_GLASSES: 'delete',
  EDIT_GLASSES: 'edit'
}
export const actions: ActionTree<GlassesState, RootState> = {
  async [ActionType.ADD_GLASSES]({ commit, rootState }, newGlasses:Glasses) {
    const request = Object.assign({}, newGlasses)
    request.location = rootState.location
    const data = await this.$axios.$post('/api/glasses', request)
    commit(IndexMutationType.ADD_OFFLINE_GLASSES, data, { root: true })
    return data
  },

  async [ActionType.FETCH_SINGLE_GLASSES]({ commit, rootState }, sku: number) {
    const data = await this.$axios.$get(`/api/glasses/${rootState.location}/${sku}`)
    commit(IndexMutationType.DELETE_OFFLINE_GLASSES, sku, { root: true })
    commit(IndexMutationType.ADD_OFFLINE_GLASSES, data, { root: true })
    return data
  },

  async [ActionType.DISPENSE_GLASSES]({ commit, rootState }, sku: number) {
    await this.$axios.$put(`/api/glasses/dispense/${rootState.location}/${sku}`, {})
    commit(IndexMutationType.DELETE_OFFLINE_GLASSES, sku, { root: true })
  },

  async [ActionType.UNDISPENSE_GLASSES]({ commit }, glasses: Glasses) {
    await this.$axios.$post('/api/glasses/undispense', glasses)
    commit(IndexMutationType.ADD_OFFLINE_GLASSES, glasses, { root: true })
  },

  async [ActionType.DELETE_GLASSES]({ commit, rootState }, sku: number) {
    await this.$axios.$delete(`/api/glasses/${rootState.location}/${sku}`)
    commit(IndexMutationType.DELETE_OFFLINE_GLASSES, sku, { root: true })
  },

  // eslint-disable-next-line require-await
  async [ActionType.EDIT_GLASSES]({ commit, rootState }, newGlasses:Glasses) {
    const request = Object.assign({}, newGlasses)
    request.location = rootState.location
    // const data = await this.$axios.$put(`/api/glasses/${rootState.location}/${newGlasses.sku}`)
    const data = newGlasses // todo enable me when edit API is ready AND REMOVE ESLINT DISABLE
    commit(IndexMutationType.DELETE_OFFLINE_GLASSES, newGlasses.sku, { root: true })
    commit(IndexMutationType.ADD_OFFLINE_GLASSES, data, { root: true })
    return data
  }
}
