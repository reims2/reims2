import { Glasses, GlassesInput, GlassesResult, GlassesSearch } from '@/model/GlassesModel'
import calculateAllPhilscore from '@/lib/philscore'

import { defineStore } from 'pinia'
import axios from 'axios'

import { useRootStore } from './root'

let cancelTokenGet = axios.CancelToken.source()

export const useGlassesStore = defineStore({
  id: 'glasses',
  actions: {
    async addGlasses(newGlasses: GlassesInput): Promise<Glasses> {
      const request = Object.assign({}, newGlasses) as any
      const rootStore = useRootStore()
      request.location = rootStore.reimsSite
      const reponse = await axios.post('/api/glasses', request)
      const addedGlasses = reponse.data
      rootStore.addOfflineGlasses(addedGlasses)
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
          rootStore.deleteOfflineGlasses(sku)
        }
        throw e
      }

      const fetchedGlasses = response.data
      rootStore.deleteOfflineGlasses(sku)
      rootStore.addOfflineGlasses(fetchedGlasses)
      return fetchedGlasses
    },
    async dispense(sku: number, reason: string) {
      const rootStore = useRootStore()
      await axios.post(`/api/glasses/${rootStore.reimsSite}/${sku}/dispense?reason=${reason}`, {})
      rootStore.deleteOfflineGlasses(sku)
    },
    async undispense(glasses: Glasses) {
      const rootStore = useRootStore()
      await axios.post(`/api/glasses/undispense/${glasses.id}`, {})
      rootStore.addOfflineGlasses(glasses)
    },
    async deleteGlasses(sku: number) {
      const rootStore = useRootStore()
      await axios.delete(`/api/glasses/${rootStore.reimsSite}/${sku}`)
      rootStore.deleteOfflineGlasses(sku)
    },
    async editGlasses(newGlasses: Glasses): Promise<Glasses> {
      const rootStore = useRootStore()
      const response = await axios.put(
        `/api/glasses/${rootStore.reimsSite}/${newGlasses.sku}`,
        newGlasses,
      )
      const editedGlasses = response.data
      rootStore.addOfflineGlasses(editedGlasses)
      return editedGlasses
    },
    philScore(terms: GlassesSearch): GlassesResult[] {
      const rootStore = useRootStore()
      return calculateAllPhilscore(terms, rootStore.allGlasses || ([] as Glasses[]))
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
  },
})
