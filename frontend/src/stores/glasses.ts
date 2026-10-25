import { Glasses, GlassesSearch, SanitizedGlassesInput } from '@/model/GlassesModel'
import type { components } from '@/model/api'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRootStore } from './root'
import { useAuthStore } from './auth'
import { ReimsAxiosError, useAxios } from '@/lib/axios'
import * as outbox from '@/lib/outbox'
import { OutboxEntry } from '@/lib/outbox'
import { DeletionReason } from '@/model/ReimsModel'
import { Dayjs } from 'dayjs'

// the generated API types check requests and responses against backend/openapi.json
type GlassesRequest = components['schemas']['GlassesRequestDTO']
type GlassesResponse = components['schemas']['GlassesResponseDTO']
type SearchLogRequest = components['schemas']['SearchLogDTO']
type ChangeValue = components['schemas']['ChangeValueDTO']

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
      const request: GlassesRequest = {
        ...newGlasses,
        location: rootStore.reimsSite,
      }
      const response = await axiosInstance.post<GlassesResponse>('/api/glasses', request)
      const addedGlasses: Glasses = response.data
      addOfflineGlasses(addedGlasses)
      return addedGlasses
    }
    async function logSearch(
      glassesSearch: GlassesSearch,
      resultCount: number,
      results: SearchLogRequest['results'],
    ): Promise<SendResult> {
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
      return sendOrQueue({ ...newEntry(), kind: 'searchLog', payload: { request } })
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
      addOfflineGlasses(fetchedGlasses)
      return fetchedGlasses
    }
    // writes go by id, so one queued offline can't hit a pair that got the SKU later
    async function dispense(glasses: Glasses, reason: DeletionReason): Promise<SendResult> {
      return sendOrQueue({ ...newEntry(), kind: 'dispense', payload: { glasses, reason } })
    }
    async function undispense(glasses: Glasses): Promise<SendResult> {
      return sendOrQueue({ ...newEntry(), kind: 'undispense', payload: { glasses } })
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
          applyLocal(entry, (await send(entry)) ?? null)
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
          const { glasses, reason } = entry.payload
          await axiosInstance.put(`/api/glasses/${glasses.id}/dispense?reason=${reason}`, {})
          return
        }
        case 'undispense': {
          const response = await axiosInstance.put<GlassesResponse>(
            `/api/glasses/${entry.payload.glasses.id}/undispense`,
            {},
          )
          // a 204 means it was already in stock and changed nothing
          return response.status === 200 ? response.data : undefined
        }
        case 'edit': {
          const request: GlassesRequest = entry.payload.glasses
          const response = await axiosInstance.put<GlassesResponse>(
            `/api/glasses/${entry.payload.glasses.id}`,
            request,
          )
          return response.data
        }
        case 'searchLog':
          await axiosInstance.post(`/api/glasses/${entry.site}/searchLog`, entry.payload.request)
      }
    }
    /**
     * Changes the local list like the server will, also while the change is still queued.
     * serverGlasses is the server's answer, null if it sent none and undefined while queued.
     */
    function applyLocal(entry: OutboxEntry, serverGlasses?: Glasses | null) {
      switch (entry.kind) {
        case 'dispense':
          deleteOfflineGlassesById(entry.payload.glasses.id)
          break
        case 'undispense': {
          if (serverGlasses === null) break
          const { glasses } = entry.payload
          const sku = glasses.dispense?.previousSku ?? glasses.sku
          addOfflineGlasses(
            serverGlasses ?? { ...glasses, sku, dispensed: false, dispense: undefined },
          )
          break
        }
        case 'edit':
          addOfflineGlasses(serverGlasses ?? entry.payload.glasses)
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
    // the server's version replaces the cached copy and a pair that held its SKU before
    function addOfflineGlasses(glasses: Glasses) {
      allGlasses.value = [
        ...allGlasses.value.filter((el) => el.id !== glasses.id && el.sku !== glasses.sku),
        glasses,
      ]
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
      pendingCount,
      hasGlassesLoaded,
      getGlassLocal,
      addGlasses,
      logSearch,
      fetchSingle,
      dispense,
      undispense,
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
      deleteOfflineGlassesById,
    }
  },
  { persist: { pick: ['allGlasses', 'lastRefresh', 'allGlassesHash', 'isOutdated'] } },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlassesStore, import.meta.hot))
}
