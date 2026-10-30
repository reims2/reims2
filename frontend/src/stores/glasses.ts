import { Glasses, GlassesSearch, SanitizedGlassesInput, SearchLog } from '@/model/GlassesModel'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRootStore } from './root'
import { useAuthStore } from './auth'
import { ReimsAxiosError, useAxios } from '@/lib/axios'
import * as outbox from '@/lib/outbox'
import { OutboxEntry } from '@/lib/outbox'
import { DeletionReason, ReimsSite } from '@/model/ReimsModel'
import { Dayjs } from 'dayjs'

export type SendResult = 'sent' | 'queued'

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
    const authStore = useAuthStore()
    const axiosInstance = useAxios()
    const allGlasses = ref([] as Glasses[])
    const allGlassesHash = ref('')
    const lastRefresh = ref(null as string | null)
    const isOutdated = ref(false)
    const isRefreshingGlasses = ref(false)
    const pendingCount = ref(0)

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
      interface GlassesRequest extends SanitizedGlassesInput {
        location: ReimsSite
      }
      const request = {
        ...newGlasses,
        location: rootStore.reimsSite,
      } as GlassesRequest
      const response = await axiosInstance.post('/api/glasses', request)
      const addedGlasses = response.data
      // the SKU may be a reissued one that is still cached for its dispensed previous pair
      deleteOfflineGlasses(addedGlasses.sku)
      addOfflineGlasses(addedGlasses)
      return addedGlasses
    }
    async function logSearch(
      glassesSearch: GlassesSearch,
      resultCount: number,
    ): Promise<SendResult> {
      let balLens = 'DISABLE_NONE'
      if (glassesSearch.os.isBAL) balLens = 'DISABLE_OS'
      if (glassesSearch.od.isBAL) balLens = 'DISABLE_OD'
      const request = {
        ...glassesSearch,
        balLens,
        searchDate: Date.now(),
        increaseSearchTolerance: glassesSearch.highTolerance,
        resultCount,
      } as SearchLog
      return sendOrQueue({ ...newEntry(), kind: 'searchLog', payload: { request } })
    }
    async function fetchSingle(sku: number): Promise<Glasses> {
      controllerFetchSingle.abort()
      controllerFetchSingle = new AbortController()
      let response
      try {
        response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}/${sku}`, {
          signal: controllerFetchSingle.signal,
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
    async function dispense(sku: number, reason: DeletionReason): Promise<SendResult> {
      return sendOrQueue({ ...newEntry(), kind: 'dispense', payload: { sku, reason } })
    }
    async function undispense(glasses: Glasses): Promise<SendResult> {
      return sendOrQueue({ ...newEntry(), kind: 'undispense', payload: { glasses } })
    }
    async function deleteGlasses(sku: number) {
      // abort running fetch all request, since the fetch all will change after this request
      controllerGetAll.abort()

      await axiosInstance.delete(`/api/glasses/${rootStore.reimsSite}/${sku}`)
      deleteOfflineGlasses(sku)
    }
    async function editGlasses(newGlasses: Glasses): Promise<SendResult> {
      return sendOrQueue({ ...newEntry(), kind: 'edit', payload: { glasses: newGlasses } })
    }
    function newEntry() {
      return { site: rootStore.reimsSite, createdAt: Date.now() }
    }
    async function sendOrQueue(entry: OutboxEntry): Promise<SendResult> {
      // abort running fetch all request, since the fetch all will change after this request
      if (entry.kind !== 'searchLog') controllerGetAll.abort()
      // a glasses change waits behind queued ones so the server gets them in order
      if (entry.kind === 'searchLog' || (await outbox.count()) === 0) {
        try {
          applyLocal(entry, await send(entry))
          return 'sent'
        } catch (e) {
          if (!(e instanceof ReimsAxiosError && e.isNetwork)) throw e
        }
      }
      await outbox.add(entry)
      applyLocal(entry)
      await refreshPendingCount()
      return 'queued'
    }
    async function send(entry: OutboxEntry): Promise<Glasses | undefined> {
      switch (entry.kind) {
        case 'dispense': {
          const { sku, reason } = entry.payload
          await axiosInstance.put(`/api/glasses/dispense/${entry.site}/${sku}?reason=${reason}`, {})
          return
        }
        case 'undispense':
          await axiosInstance.put(`/api/glasses/undispense/${entry.payload.glasses.id}`, {})
          return
        case 'edit': {
          const { glasses } = entry.payload
          return (await axiosInstance.put(`/api/glasses/${entry.site}/${glasses.sku}`, glasses))
            .data
        }
        case 'searchLog':
          await axiosInstance.post(`/api/glasses/${entry.site}/searchLog`, entry.payload.request)
      }
    }
    /** Changes the local list like the server will, also while the change is still queued */
    function applyLocal(entry: OutboxEntry, editedGlasses?: Glasses) {
      switch (entry.kind) {
        case 'dispense':
          deleteOfflineGlasses(entry.payload.sku)
          break
        case 'undispense': {
          const { glasses } = entry.payload
          const sku = glasses.dispense?.previousSku ?? glasses.sku
          addOfflineGlasses({ ...glasses, sku, dispensed: false, dispense: undefined })
          break
        }
        case 'edit':
          if (entry.payload.glasses.sku) deleteOfflineGlasses(entry.payload.glasses.sku)
          addOfflineGlasses(editedGlasses ?? entry.payload.glasses)
      }
    }
    async function refreshPendingCount() {
      pendingCount.value = await outbox.count()
    }
    async function uploadPending() {
      if (!authStore.isLoggedIn) return
      try {
        await outbox.flush(send)
      } finally {
        await refreshPendingCount()
      }
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
        const newHash = response.data.hashValue
        if (newHash !== allGlassesHash.value) {
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
      controllerGetAll.abort() // not really necessary
      controllerGetAll = new AbortController()
      isRefreshingGlasses.value = true
      let response
      try {
        response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}/all`, {
          timeout: 60000,
          signal: controllerGetAll.signal,
        })
      } finally {
        isRefreshingGlasses.value = false
      }
      allGlasses.value = response.data
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
        allGlasses.value = allGlasses.value.filter((el) => el.sku !== sku)
      }
    }

    return {
      allGlasses,
      lastRefresh,
      isOutdated,
      allGlassesHash,
      isRefreshingGlasses,
      pendingCount,
      hasGlassesLoaded,
      getGlassLocal,
      addGlasses,
      logSearch,
      fetchSingle,
      dispense,
      undispense,
      deleteGlasses,
      editGlasses,
      refreshPendingCount,
      uploadPending,
      loadSearchesCsv,
      loadDispensedCsv,
      loadInventoryCsv,
      getDispensedGlasses,
      loadGlassesIfChanged,
      loadGlasses,
      addOfflineGlasses,
      deleteOfflineGlasses,
    }
  },
  { persist: { pick: ['allGlasses', 'lastRefresh', 'allGlassesHash', 'isOutdated'] } },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlassesStore, import.meta.hot))
}
