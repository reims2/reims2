import type { MutationTree, ActionTree } from 'vuex'
import { Glasses } from '~/model/GlassesModel'

const arrayContainsSku = (data: Glasses[], sku: number) => data.some(e => e.sku === sku)

export interface RootState {
  allGlasses: Glasses[],
  lastRefresh: Date | null,
  location: string,
  error: string,
  drawer: boolean
}
export const state = (): RootState => ({
  allGlasses: [],
  lastRefresh: null,
  location: 'sa',
  error: '',
  drawer: false
})

export const MutationType = {
  SET_GLASSES: 'setGlasses',
  SET_LOCATION: 'setLocation',
  SET_LAST_REFRESH: 'setLastRefresh',
  DELETE_OFFLINE_GLASSES: 'deleteOfflineGlasses',
  ADD_OFFLINE_GLASSES: 'addOfflineGlasses',
  SET_ERROR: 'setError',
  CLEAR_ERROR: 'clearError',
  TOGGLE_DRAWER: 'toggleDrawer',
  SET_DRAWER: 'setDrawer'
}
export const mutations: MutationTree<RootState> = {
  [MutationType.SET_GLASSES]: (state, value: Glasses[]) => { state.allGlasses = value },
  [MutationType.SET_LOCATION]: (state, value: string) => { state.location = value },
  [MutationType.SET_LAST_REFRESH]: (state, value: Date) => { state.lastRefresh = value },
  [MutationType.DELETE_OFFLINE_GLASSES]: (state, sku: number) => {
    if (arrayContainsSku(state.allGlasses, sku)) {
      state.allGlasses = state.allGlasses.filter(el => el.sku !== sku)
    }
  },
  [MutationType.ADD_OFFLINE_GLASSES]: (state, glasses: Glasses) => {
    if (!arrayContainsSku(state.allGlasses, glasses.sku)) {
      state.allGlasses.push(glasses)
    }
  },
  [MutationType.SET_ERROR]: (state, message:string) => {
    state.error = message
  },
  [MutationType.CLEAR_ERROR]: (state) => {
    state.error = ''
  },
  [MutationType.TOGGLE_DRAWER]: (state) => {
    state.drawer = !state.drawer
  },
  [MutationType.SET_DRAWER]: (state, value) => {
    state.drawer = value
  }
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
    const data = await this.$axios.$get(`/api/glasses/${state.location}`, { params: { size: 100000 } }) as any
    commit(MutationType.SET_GLASSES, data.glasses)
    commit(MutationType.SET_LAST_REFRESH, new Date())
  }

}
