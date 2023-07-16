import { Glasses, GlassesInput, GlassesResult, GlassesSearch } from '@/model/GlassesModel'
import calculateAllPhilscore from '@/lib/philscore'
import { defineStore, acceptHMRUpdate } from 'pinia'
import axios from 'axios'
import { useRootStore } from './root'

const arrayContainsSku = (data: Glasses[], sku: number) => data.some((e) => e.sku === sku)

let cancelTokenGet = axios.CancelToken.source()

export const useGlassesStore = defineStore({
  id: 'glasses',
  persist: true,
  state: () => ({
    allGlasses: [] as Glasses[],
    lastRefresh: null as string | null,
    isOutdated: false,
    isRefreshingGlasses: false,
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
    async addGlasses(newGlasses: GlassesInput): Promise<Glasses> {
      const request = Object.assign({}, newGlasses) as any
      const rootStore = useRootStore()
      request.location = rootStore.reimsSite
      const reponse = await axios.post('/api/glasses', request)
      const addedGlasses = reponse.data
      this.addOfflineGlasses(addedGlasses)
      return addedGlasses
    },
    async fetchSingle(sku: number): Promise<Glasses> {
      const rootStore = useRootStore()
      if (cancelTokenGet) cancelTokenGet.cancel()
      cancelTokenGet = axios.CancelToken.source()
      let response
      try {
        response = await axios.get(`/api/glasses/${rootStore.reimsSite}/${sku}`, {
          cancelToken: cancelTokenGet.token,
        })
      } catch (e) {
        if ((e as any).response && (e as any).response.status === 404) {
          // delete glasses from local db if it doesn't exist on server
          this.deleteOfflineGlasses(sku)
        }
        throw e
      }

      const fetchedGlasses = response.data
      this.deleteOfflineGlasses(sku)
      this.addOfflineGlasses(fetchedGlasses)
      return fetchedGlasses
    },
    async dispense(sku: number, reason: string) {
      const rootStore = useRootStore()
      await axios.put(`/api/glasses/dispense/${rootStore.reimsSite}/${sku}?reason=${reason}`, {})
      this.deleteOfflineGlasses(sku)
    },
    async undispense(glasses: Glasses) {
      await axios.put(`/api/glasses/undispense/${glasses.id}`, {})
      this.addOfflineGlasses(glasses)
    },
    async deleteGlasses(sku: number) {
      const rootStore = useRootStore()
      await axios.delete(`/api/glasses/${rootStore.reimsSite}/${sku}`)
      this.deleteOfflineGlasses(sku)
    },
    async editGlasses(newGlasses: Glasses): Promise<Glasses> {
      const rootStore = useRootStore()
      const response = await axios.put(
        `/api/glasses/${rootStore.reimsSite}/${newGlasses.sku}`,
        newGlasses,
      )
      const editedGlasses = response.data
      this.addOfflineGlasses(editedGlasses)
      return editedGlasses
    },
    philScore(terms: GlassesSearch): GlassesResult[] {
      return calculateAllPhilscore(terms, this.allGlasses || ([] as Glasses[]))
    },
    async loadDispensedCsv(startDate: string, endDate: string): Promise<any> {
      const rootStore = useRootStore()
      const params: any = { startDate, endDate }
      const response = await axios.get(`/api/glasses/dispensed/${rootStore.reimsSite}.csv`, {
        params,
        responseType: 'blob',
      })
      return response.data
    },
    async loadInventoryCsv(): Promise<any> {
      const rootStore = useRootStore()
      const response = await axios.get(`/api/glasses/${rootStore.reimsSite}.csv`, {
        responseType: 'blob',
      })
      return response.data
    },
    async loadGlasses() {
      const rootStore = useRootStore()
      const response = await axios.get(`/api/glasses/${rootStore.reimsSite}`, {
        params: { size: 100000 },
        timeout: 60000,
      })
      this.allGlasses = response.data.glasses
      this.lastRefresh = new Date().toISOString()
      this.isOutdated = false
      this.isRefreshingGlasses = false
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
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlassesStore, import.meta.hot))
}
