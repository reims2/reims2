import { Glasses, GlassesSearch, SanitizedGlassesInput } from '@/model/GlassesModel'
import type { components } from '@/model/api'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRootStore } from './root'
import { ReimsAxiosError, useAxios } from '@/lib/axios'
import { DeletionReason } from '@/model/ReimsModel'
import { Dayjs } from 'dayjs'

// the generated API types check requests and responses against backend/openapi.json
type GlassesRequest = components['schemas']['GlassesRequestDTO']
type GlassesResponse = components['schemas']['GlassesResponseDTO']
type SearchLogRequest = components['schemas']['SearchLogDTO']
type ChangeValue = components['schemas']['ChangeValueDTO']

const arrayContainsSku = (data: Glasses[], sku: number | null) => {
  if (sku === null) return false
  return data.some((e) => e.sku === sku)
}
let controllerFetchSingle = new AbortController()
let controllerGetAll = new AbortController()

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
      // abort running fetch all request, since the fetch all will change after this request
      controllerGetAll.abort()
      const request: GlassesRequest = {
        ...newGlasses,
        location: rootStore.reimsSite,
      }
      const response = await axiosInstance.post<GlassesResponse>('/api/glasses', request)
      const addedGlasses: Glasses = response.data
      // the SKU may be a reissued one that is still cached for its dispensed previous pair
      if (addedGlasses.sku !== null) deleteOfflineGlasses(addedGlasses.sku)
      addOfflineGlasses(addedGlasses)
      return addedGlasses
    }
    async function logSearch(
      glassesSearch: GlassesSearch,
      resultCount: number,
      results: SearchLogRequest['results'],
    ): Promise<void> {
      let balLens: SearchLogRequest['balLens'] = 'DISABLE_NONE'
      if (glassesSearch.os.isBAL) balLens = 'DISABLE_OS'
      if (glassesSearch.od.isBAL) balLens = 'DISABLE_OD'
      const request: SearchLogRequest = {
        ...glassesSearch,
        balLens,
        searchDate: Date.now(),
        increaseSearchTolerance: glassesSearch.highTolerance ?? false,
        resultCount,
        results,
      }
      await axiosInstance.post(`/api/glasses/${rootStore.reimsSite}/searchLog`, request)
    }
    async function fetchSingle(sku: number): Promise<Glasses> {
      controllerFetchSingle.abort()
      controllerFetchSingle = new AbortController()
      let response
      try {
        response = await axiosInstance.get<GlassesResponse>(
          `/api/glasses/${rootStore.reimsSite}/${sku}`,
          {
            signal: controllerFetchSingle.signal,
          },
        )
      } catch (e) {
        if (e instanceof ReimsAxiosError && e.statusCode === 404) {
          // delete glasses from local db if it doesn't exist on server
          deleteOfflineGlasses(sku)
        }
        throw e
      }

      const fetchedGlasses: Glasses = response.data
      deleteOfflineGlasses(sku)
      addOfflineGlasses(fetchedGlasses)
      return fetchedGlasses
    }
    // writes go by id, so one queued offline can't hit a pair that got the SKU later.
    // False if the pair was already dispensed, e.g. on another device.
    async function dispense(glasses: Glasses, reason: DeletionReason): Promise<boolean> {
      // abort running fetch all request, since the fetch all will change after this request
      controllerGetAll.abort()

      const response = await axiosInstance.put(
        `/api/glasses/${glasses.id}/dispense?reason=${reason}`,
        {},
      )
      deleteOfflineGlassesById(glasses.id)
      return response.status !== 204
    }
    async function undispense(glasses: Glasses) {
      // abort running fetch all request, since the fetch all will change after this request
      controllerGetAll.abort()

      await axiosInstance.put(`/api/glasses/${glasses.id}/undispense`, {})
      const sku = glasses.dispense?.previousSku ?? glasses.sku
      if (sku === null) return
      // only the stored fields, a Find result also carries its scores
      const { id, glassesType, glassesSize, appearance, location, creationDate, od, os } = glasses
      deleteOfflineGlasses(sku)
      addOfflineGlasses({
        id,
        sku,
        glassesType,
        glassesSize,
        appearance,
        location,
        creationDate,
        od,
        os,
        dispensed: false,
        dispense: { modifyDate: null, previousSku: null, dispenseReason: null },
      })
    }
    async function editGlasses(newGlasses: Glasses): Promise<Glasses> {
      // abort running fetch all request, since the fetch all will change after this request
      controllerGetAll.abort()

      const request: GlassesRequest = newGlasses
      const response = await axiosInstance.put<GlassesResponse>(
        `/api/glasses/${newGlasses.id}`,
        request,
      )
      const editedGlasses: Glasses = response.data
      addOfflineGlasses(editedGlasses)
      return editedGlasses
    }
    async function loadSearchesCsv(): Promise<Blob> {
      const response = await axiosInstance.get(
        `/api/glasses/unsuccessful/${rootStore.reimsSite}.csv`,
        { responseType: 'blob' },
      )
      return response.data
    }
    async function loadDispensedCsv(): Promise<Blob> {
      const response = await axiosInstance.get(
        `/api/glasses/dispensed/${rootStore.reimsSite}.csv`,
        { responseType: 'blob' },
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
      const response = await axiosInstance.get<GlassesResponse[]>(
        `/api/glasses/dispensed/${rootStore.reimsSite}`,
        {
          params,
        },
      )
      return response.data
    }
    async function loadGlassesIfChanged() {
      if (!isRefreshingGlasses.value) await refreshGlasses(false)
    }
    async function loadGlasses() {
      await refreshGlasses(true)
    }
    // the hash goes first, so a write in between only causes another load later
    async function refreshGlasses(force: boolean) {
      controllerGetAll.abort()
      const controller = new AbortController()
      controllerGetAll = controller
      const site = rootStore.reimsSite
      isRefreshingGlasses.value = true
      try {
        const change = await axiosInstance.get<ChangeValue>(`/api/glasses/${site}/changes`, {
          signal: controller.signal,
        })
        if (force || change.data.hashValue !== allGlassesHash.value) {
          const response = await axiosInstance.get<GlassesResponse[]>(`/api/glasses/${site}/all`, {
            timeout: 60000,
            signal: controller.signal,
          })
          allGlasses.value = response.data
        }
        allGlassesHash.value = change.data.hashValue
        lastRefresh.value = new Date().toISOString()
        isOutdated.value = false
      } finally {
        if (controllerGetAll === controller) isRefreshingGlasses.value = false
      }
    }
    function addOfflineGlasses(glasses: Glasses) {
      deleteOfflineGlassesById(glasses.id)
      allGlasses.value.push(glasses)
    }
    function deleteOfflineGlassesById(id: number) {
      if (allGlasses.value.some((el) => el.id === id)) {
        allGlasses.value = allGlasses.value.filter((el) => el.id !== id)
      }
    }
    function deleteOfflineGlasses(sku: number) {
      if (arrayContainsSku(allGlasses.value, sku)) {
        // call arrayContainsSku to avoid unnecessary reactive changes when replacing the array like this
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
      logSearch,
      fetchSingle,
      dispense,
      undispense,
      editGlasses,
      loadSearchesCsv,
      loadDispensedCsv,
      loadInventoryCsv,
      getDispensedGlasses,
      loadGlassesIfChanged,
      loadGlasses,
      addOfflineGlasses,
      deleteOfflineGlasses,
      deleteOfflineGlassesById,
    }
  },
  { persist: { pick: ['allGlasses', 'lastRefresh', 'allGlassesHash', 'isOutdated'] } },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlassesStore, import.meta.hot))
}
