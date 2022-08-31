import type { ActionTree, MutationTree, GetterTree } from 'vuex'
import { RootState, MutationType as IndexMutationType } from '.'
import { Glasses } from '~/model/GlassesModel'
import calculateAllPhilscore from '~/lib/philscore'
const axios = require('axios').default

let cancelTokenGet = axios.CancelToken.source()
export interface GlassesState {
}
export const state = (): GlassesState => ({
})

export const MutationType = {
}
export const mutations: MutationTree<GlassesState> = {
}

export const GettersType = {
  GET_SINGLE_GLASS: 'getSingle',
  HAS_GLASSES_LOADED: 'hasGlassesLoaded'
}

export const getters: GetterTree<GlassesState, RootState> = {
  [GettersType.GET_SINGLE_GLASS]: (_state: GlassesState, _getters: GetterTree<GlassesState, RootState>, rootState: RootState) => (sku: number) => {
    return rootState.allGlasses.find(glass => glass.sku === sku)
  },
  [GettersType.HAS_GLASSES_LOADED]: (_state: GlassesState, _getters: GetterTree<GlassesState, RootState>, rootState: RootState) => {
    return rootState.allGlasses.length > 0
  }
}

export const ActionType = {
  ADD_GLASSES: 'addGlasses',
  FETCH_SINGLE_GLASSES: 'fetchSingle',
  DISPENSE_GLASSES: 'dispense',
  UNDISPENSE_GLASSES: 'undispense',
  DELETE_GLASSES: 'delete',
  EDIT_GLASSES: 'edit',
  PHIL_SCORE: 'philScore',
  LOAD_DISPENSED_CSV: 'loadDispensedCsv',
  LOAD_UNDISPENSED_CSV: 'loadUndispensedCsv'
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
    if (cancelTokenGet) cancelTokenGet.cancel()
    cancelTokenGet = axios.CancelToken.source()
    const data = await this.$axios.$get(`/api/glasses/${rootState.location}/${sku}`, { cancelToken: cancelTokenGet.token, progress: false })
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

  async [ActionType.EDIT_GLASSES]({ commit, rootState }, newGlasses:Glasses) {
    const data = await this.$axios.$put(`/api/glasses/${rootState.location}/${newGlasses.sku}`, newGlasses)
    commit(IndexMutationType.DELETE_OFFLINE_GLASSES, newGlasses.sku, { root: true })
    commit(IndexMutationType.ADD_OFFLINE_GLASSES, data, { root: true })
    return data
  },
  [ActionType.PHIL_SCORE]({ rootState }, eyeModel) {
    return calculateAllPhilscore(eyeModel, rootState.allGlasses || [])
  },

  async [ActionType.LOAD_DISPENSED_CSV]({ rootState }, { startDate, endDate }) {
    const params:any = { startDate, endDate }
    const data = await this.$axios.$get(`/api/glasses/dispensed/${rootState.location}.csv`, { params, responseType: 'blob' })
    return data
  },
  async [ActionType.LOAD_UNDISPENSED_CSV]({ rootState }) {
    const data = await this.$axios.$get(`/api/glasses/${rootState.location}.csv`, { responseType: 'blob' })
    return data
  }
}
