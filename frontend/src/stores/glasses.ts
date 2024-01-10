import {
  Glasses,
  GlassesSearch,
  SanitizedGlassesInput,
  UnsuccessfulGlassesSearch,
} from '@/model/GlassesModel'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRootStore } from './root'
import axios from 'axios'
import { ReimsAxiosError, useAxios } from '@/lib/axios'
import { DeletionReason, ReimsSite } from '@/model/ReimsModel'
import { Dayjs } from 'dayjs'

const arrayContainsSku = (data: Glasses[], sku: number | null) => {
  if (sku === null) return false
  return data.some((e) => e.sku === sku)
}
let cancelTokenGet = axios.CancelToken.source()

export const useGlassesStore = defineStore(
  'glasses',
  () => {
    const rootStore = useRootStore()
    const axiosInstance = useAxios()
    const allGlasses = ref([] as Glasses[])
    const allGlassesHash = ref('')
    const lastRefresh = ref(null as string | null)
    const isOutdated = ref(false)
    const isRefreshingGlasses = ref(false)

    const hasGlassesLoaded = computed(() => {
      return allGlasses.value.length > 0
    })
    const getGlassLocal = (sku: number): Glasses | null => {
      if (isNaN(sku)) return null
      return allGlasses.value.find((glass) => glass.sku === sku) || null
    }

    async function addGlasses(newGlasses: SanitizedGlassesInput): Promise<Glasses> {
      interface GlassesRequest extends SanitizedGlassesInput {
        location: ReimsSite
      }
      const request = {
        ...newGlasses,
        location: rootStore.reimsSite,
      } as GlassesRequest
      const response = await axiosInstance.post('/api/glasses', request)
      const addedGlasses = response.data
      addOfflineGlasses(addedGlasses)
      return addedGlasses
    }
    async function addUnsuccessfulSearch(glassesSearch: GlassesSearch): Promise<void> {
      let balLens = 'DISABLE_NONE'
      if (glassesSearch.os.isBAL) balLens = 'DISABLE_OS'
      if (glassesSearch.od.isBAL) balLens = 'DISABLE_OD'
      const request = {
        ...glassesSearch,
        // todo remove location in future
        location: rootStore.reimsSite,
        balLens,
        searchDate: Date.now(),
      } as UnsuccessfulGlassesSearch
      await axiosInstance.post(`/api/glasses/${rootStore.reimsSite}/unsuccessfulSearch`, request)
    }
    async function fetchSingle(sku: number): Promise<Glasses> {
      if (cancelTokenGet) cancelTokenGet.cancel()
      cancelTokenGet = axios.CancelToken.source()
      let response
      try {
        response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}/${sku}`, {
          cancelToken: cancelTokenGet.token,
        })
      } catch (e) {
        if (e instanceof ReimsAxiosError && e.statusCode === 404) {
          // delete glasses from local db if it doesn't exist on server
          deleteOfflineGlasses(sku)
        }
        throw e
      }

      const fetchedGlasses = response.data
      deleteOfflineGlasses(sku)
      addOfflineGlasses(fetchedGlasses)
      return fetchedGlasses
    }
    async function dispense(sku: number, reason: DeletionReason) {
      await axiosInstance.put(
        `/api/glasses/dispense/${rootStore.reimsSite}/${sku}?reason=${reason}`,
        {},
      )
      deleteOfflineGlasses(sku)
    }
    async function undispense(glasses: Glasses) {
      await axiosInstance.put(`/api/glasses/undispense/${glasses.id}`, {})
      addOfflineGlasses(glasses)
    }
    async function deleteGlasses(sku: number) {
      await axiosInstance.delete(`/api/glasses/${rootStore.reimsSite}/${sku}`)
      deleteOfflineGlasses(sku)
    }
    async function editGlasses(newGlasses: Glasses): Promise<Glasses> {
      const response = await axiosInstance.put(
        `/api/glasses/${rootStore.reimsSite}/${newGlasses.sku}`,
        newGlasses,
      )
      const editedGlasses = response.data
      if (newGlasses.sku) deleteOfflineGlasses(newGlasses.sku)
      addOfflineGlasses(editedGlasses)
      return editedGlasses
    }

    async function loadDispensedCsv(startDate: Dayjs, endDate: Dayjs): Promise<Blob> {
      const params = {
        startDate: startDate.format('MM/DD/YYYY'),
        endDate: endDate.format('MM/DD/YYYY'),
      }
      const response = await axiosInstance.get(
        `/api/glasses/dispensed/${rootStore.reimsSite}.csv`,
        {
          params,
          responseType: 'blob',
        },
      )
      return response.data
    }
    async function loadInventoryCsv(): Promise<Blob> {
      const response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}.csv`, {
        responseType: 'blob',
      })
      return response.data
    }
    async function getDispensedGlasses(startDate: Dayjs, endDate: Dayjs): Promise<Glasses[]> {
      const params = {
        startDate: startDate.format('MM/DD/YYYY'),
        endDate: endDate.format('MM/DD/YYYY'),
      }
      const response = await axiosInstance.get(`/api/glasses/dispensed/${rootStore.reimsSite}`, {
        params,
      })
      return response.data
    }
    async function loadGlassesIfChanged() {
      if (isRefreshingGlasses.value) return
      isRefreshingGlasses.value = true
      try {
        const response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}/changes`)
        const newHash = response.data
        if (newHash !== allGlassesHash.value) {
          console.log('loading glasses, new hash')
          await loadGlasses()
        }
        allGlassesHash.value = newHash
        lastRefresh.value = new Date().toISOString()
        isOutdated.value = false
      } finally {
        isRefreshingGlasses.value = false
      }
    }
    async function loadGlasses() {
      isRefreshingGlasses.value = true
      let response
      try {
        response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}`, {
          params: { size: 100000 },
          timeout: 60000,
        })
      } finally {
        isRefreshingGlasses.value = false
      }
      allGlasses.value = response.data.glasses
      lastRefresh.value = new Date().toISOString()
      isOutdated.value = false
    }
    function addOfflineGlasses(glasses: Glasses) {
      if (!arrayContainsSku(allGlasses.value, glasses.sku)) {
        allGlasses.value.push(glasses)
      }
    }
    function deleteOfflineGlasses(sku: number) {
      if (arrayContainsSku(allGlasses.value, sku)) {
        // call arrayContainsSku to avoid unnecessary reactive changes when replacing the array like this
        // TODO?
        allGlasses.value = allGlasses.value.filter((el) => el.sku !== sku)
      }
    }

    return {
      allGlasses,
      lastRefresh,
      isOutdated,
      allGlassesHash,
      isRefreshingGlasses,
      hasGlassesLoaded,
      getGlassLocal,
      addGlasses,
      addUnsuccessfulSearch,
      fetchSingle,
      dispense,
      undispense,
      deleteGlasses,
      editGlasses,
      loadDispensedCsv,
      loadInventoryCsv,
      getDispensedGlasses,
      loadGlassesIfChanged,
      loadGlasses,
      addOfflineGlasses,
      deleteOfflineGlasses,
    }
  },
  { persist: { paths: ['allGlasses', 'lastRefresh', 'allGlassesHash', 'isOutdated'] } },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlassesStore, import.meta.hot))
}
