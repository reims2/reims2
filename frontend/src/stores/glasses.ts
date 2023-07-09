import { Glasses, GlassesSearch } from '@/model/GlassesModel'
import calculateAllPhilscore from '@/lib/philscore'

import { defineStore } from 'pinia'
import axios from 'axios'

import { useRootStore } from './root'

let cancelTokenGet = axios.CancelToken.source()

export const useGlassesStore = defineStore({
  id: 'glasses',
  actions: {
    async addGlasses(newGlasses: Glasses): Promise<Glasses> {
      const request = Object.assign({}, newGlasses)
      const rootStore = useRootStore()
      request.location = rootStore.location
      const data = await axios.post('/api/glasses', request)
      const addedGlasses = data as unknown as Glasses
      rootStore.addOfflineGlasses(addedGlasses)
      return addedGlasses
    },
    async fetchSingle(sku: number): Promise<Glasses> {
      const rootStore = useRootStore()
      if (cancelTokenGet) cancelTokenGet.cancel()
      cancelTokenGet = axios.CancelToken.source()
      let data
      try {
        data = await axios.get(`/api/glasses/${rootStore.location}/${sku}`, {
          cancelToken: cancelTokenGet.token,
        })
      } catch (e) {
        if ((e as any).response && (e as any).response.status === 404) {
          // delete glasses from local db if it doesn't exist on server
          rootStore.deleteOfflineGlasses(sku)
        }
        throw e
      }

      const fetchedGlasses = data as unknown as Glasses
      rootStore.deleteOfflineGlasses(sku)
      rootStore.addOfflineGlasses(fetchedGlasses)
      return fetchedGlasses
    },
    async dispense(sku: number, reason: string) {
      const rootStore = useRootStore()
      await axios.post(`/api/glasses/${rootStore.location}/${sku}/dispense?reason=${reason}`, {})
      rootStore.deleteOfflineGlasses(sku)
    },
    async undispense(glasses: Glasses) {
      const rootStore = useRootStore()
      await axios.post(`/api/glasses/undispense/${glasses.id}`, {})
      rootStore.addOfflineGlasses(glasses)
    },
    async deleteGlasses(sku: number) {
      const rootStore = useRootStore()
      await axios.delete(`/api/glasses/${rootStore.location}/${sku}`)
      rootStore.deleteOfflineGlasses(sku)
    },
    async editGlasses(newGlasses: Glasses): Promise<Glasses> {
      const rootStore = useRootStore()
      const data = await axios.put(
        `/api/glasses/${rootStore.location}/${newGlasses.sku}`,
        newGlasses,
      )
      const editedGlasses = data as unknown as Glasses
      rootStore.deleteOfflineGlasses(newGlasses.sku)
      rootStore.addOfflineGlasses(editedGlasses)
      return editedGlasses
    },
    philScore(terms: GlassesSearch): Glasses[] {
      const rootStore = useRootStore()
      return calculateAllPhilscore(terms, rootStore.allGlasses || ([] as Glasses[]))
    },
    async loadDispensedCsv(startDate: string, endDate: string): Promise<any> {
      const rootStore = useRootStore()
      const params: any = { startDate, endDate }
      const data = await axios.get(`/api/glasses/dispensed/${rootStore.location}.csv`, {
        params,
        responseType: 'blob',
      })
      return data
    },
    async loadInventoryCsv(): Promise<any> {
      const rootStore = useRootStore()
      const data = await axios.get(`/api/glasses/${rootStore.location}.csv`, {
        responseType: 'blob',
      })
      return data
    },
  },
})
