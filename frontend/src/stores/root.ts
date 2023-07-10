import { Glasses } from '@/model/GlassesModel'
import { defineStore } from 'pinia'
import axios from 'axios'

const arrayContainsSku = (data: Glasses[], sku: number) => data.some((e) => e.sku === sku)

export const useRootStore = defineStore({
  id: 'root',
  state: () => ({
    allGlasses: [] as Glasses[],
    lastRefresh: null as string | null,
    reimsSite: 'sa',
    error: '',
    drawer: false,
    isOutdated: false,
    isRefreshingGlasses: false,
    isOffline: false,
    isMobile: false,
    isDev: false,
    version: '0.0.0',
  }),
  getters: {
    hasGlassesLoaded: (state) => {
      return state.allGlasses.length > 0
    },
    getSingle: (state) => (sku: number) => {
      return state.allGlasses.find((glass) => glass.sku === sku)
    },
  },
  actions: {
    async loadGlasses() {
      const response = await axios.get(`/api/glasses/${this.reimsSite}`, {
        params: { size: 100000 },
        timeout: 60000,
      })
      this.allGlasses = response.data.glasses
      this.lastRefresh = new Date().toISOString()
      this.isOutdated = false
      this.isRefreshingGlasses = false
    },
    clearError() {
      this.error = ''
    },
    addOfflineGlasses(glasses: Glasses) {
      if (!arrayContainsSku(this.allGlasses, glasses.sku)) {
        this.allGlasses.push(glasses)
      }
    },
    deleteOfflineGlasses(sku: number) {
      if (arrayContainsSku(this.allGlasses, sku)) {
        // call arrayContainsSku to avoid unnecessary reactive changes when replacing the array like this TODO
        this.allGlasses = this.allGlasses.filter((el) => el.sku !== sku)
      }
    },
    toggleDrawer() {
      this.drawer = !this.drawer
    },
    setError(error: string) {
      this.error = error
    },
  },
})
