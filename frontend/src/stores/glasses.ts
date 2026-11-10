import { Glasses, GlassesSearch, SanitizedGlassesInput } from '@/model/GlassesModel'
import type { components } from '@/model/api'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRootStore } from './root'
import { useAuthStore } from './auth'
import { ApiError, fetchWithin, useApi } from '@/lib/api'
import * as outbox from '@/lib/outbox'
import { DeletionReason } from '@/model/ReimsModel'
import { Dayjs } from 'dayjs'

// the generated API types check requests and responses against backend/openapi.json
type GlassesRequest = components['schemas']['GlassesRequestDTO']
type SearchLogRequest = components['schemas']['SearchLogDTO']

export type SendResult = 'sent' | 'queued'

let controllerFetchSingle = new AbortController()
let controllerGetAll = new AbortController()

export const useGlassesStore = defineStore(
  'glasses',
  () => {
    const rootStore = useRootStore()
    const authStore = useAuthStore()
    const api = useApi()
    // only ever replaced whole, so consumers track one dependency instead of every field
    const allGlasses = shallowRef<Glasses[]>([])
    const allGlassesHash = ref('')
    const lastRefresh = ref(null as string | null)
    const isOutdated = ref(false)
    const isRefreshingGlasses = ref(false)
    const pendingCount = computed(() => outbox.queue.value.length)

    const hasGlassesLoaded = computed(() => allGlasses.value.length > 0)
    const getGlassLocal = (sku: number): Glasses | null =>
      allGlasses.value.find((glass) => glass.sku === sku) ?? null

    async function addGlasses(newGlasses: SanitizedGlassesInput): Promise<Glasses> {
      // abort running fetch all request, since the fetch all will change after this request
      controllerGetAll.abort()
      const request: GlassesRequest = { ...newGlasses, location: rootStore.reimsSite }
      const { data } = await api.POST('/api/glasses', { body: request })
      addOfflineGlasses(data!)
      return data!
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
      await api.POST('/api/glasses/{location}/searchLog', {
        params: { path: { location: rootStore.reimsSite } },
        body: request,
      })
    }
    async function fetchSingle(sku: number): Promise<Glasses> {
      controllerFetchSingle.abort()
      controllerFetchSingle = new AbortController()
      try {
        const { data } = await api.GET('/api/glasses/{location}/{sku}', {
          params: { path: { location: rootStore.reimsSite, sku } },
          signal: controllerFetchSingle.signal,
        })
        addOfflineGlasses(data!)
        return data!
      } catch (e) {
        // gone on the server, so drop the cached copy
        if (e instanceof ApiError && e.statusCode === 404) removeCached((g) => g.sku === sku)
        throw e
      }
    }
    // writes go by id, so one queued offline can't hit a pair that got the SKU later
    async function dispense(glasses: Glasses, reason: DeletionReason): Promise<SendResult> {
      return sendOrQueue({ kind: 'dispense', glasses, reason })
    }
    async function undispense(glasses: Glasses): Promise<SendResult> {
      return sendOrQueue({ kind: 'undispense', glasses })
    }
    async function editGlasses(glasses: Glasses): Promise<SendResult> {
      return sendOrQueue({ kind: 'edit', glasses })
    }
    async function sendOrQueue(change: outbox.Change): Promise<SendResult> {
      // abort running fetch all request, since the fetch all will change after this request
      controllerGetAll.abort()
      // a change waits behind queued ones so the server gets them in order
      if (outbox.queue.value.length === 0) {
        try {
          updateCache(change, await send(change))
          return 'sent'
        } catch (e) {
          if (!(e instanceof ApiError)) throw e
          // dispensed or gone on the server, a retry can't help
          if (e.statusCode === 404 || e.statusCode === 409)
            removeCached((g) => g.id === change.glasses.id)
          if (!e.isNetwork) throw e
        }
      }
      outbox.add(change)
      updateCache(change)
      return 'queued'
    }
    /** Returns the server's version of the pair, if it sent one */
    async function send(change: outbox.Change): Promise<Glasses | undefined> {
      const path = { id: change.glasses.id }
      switch (change.kind) {
        case 'dispense':
          await api.PUT('/api/glasses/{id}/dispense', {
            params: { path, query: { reason: change.reason } },
          })
          return
        case 'undispense':
          // a 204 has no body, the pair was already in stock
          return (await api.PUT('/api/glasses/{id}/undispense', { params: { path } })).data
        case 'edit': {
          const request: GlassesRequest = change.glasses
          return (await api.PUT('/api/glasses/{id}', { params: { path }, body: request })).data
        }
      }
    }
    /** Changes the cache like the server did, or will once a queued change uploads */
    function updateCache({ kind, glasses }: outbox.Change, fromServer?: Glasses) {
      if (fromServer) addOfflineGlasses(fromServer)
      else if (kind === 'dispense') removeCached((g) => g.id === glasses.id)
      else if (kind === 'edit') addOfflineGlasses(glasses)
      else {
        const sku = glasses.dispense?.previousSku ?? glasses.sku
        const dispense = {
          modifyDate: new Date().toISOString(),
          previousSku: null,
          dispenseReason: null,
        }
        addOfflineGlasses({ ...glasses, sku, dispensed: false, dispense })
      }
    }
    async function uploadPending() {
      if (!authStore.isLoggedIn) return
      // a dropped change was already applied to the cache, the next poll reloads it
      if (await outbox.flush(send)) allGlassesHash.value = ''
    }
    type CsvPath =
      | '/api/glasses/{location}.csv'
      | '/api/glasses/dispensed/{location}.csv'
      | '/api/glasses/unsuccessful/{location}.csv'
    // a 204 means nothing to export
    async function loadCsv(path: CsvPath): Promise<Blob> {
      const { data } = await api.GET(path, {
        params: { path: { location: rootStore.reimsSite } },
        parseAs: 'blob',
      })
      return data ?? new Blob()
    }
    const loadSearchesCsv = () => loadCsv('/api/glasses/unsuccessful/{location}.csv')
    const loadDispensedCsv = () => loadCsv('/api/glasses/dispensed/{location}.csv')
    const loadInventoryCsv = () => loadCsv('/api/glasses/{location}.csv')
    async function getDispensedGlasses(startDate: Dayjs, endDate: Dayjs): Promise<Glasses[]> {
      const { data } = await api.GET('/api/glasses/dispensed/{location}', {
        params: {
          path: { location: rootStore.reimsSite },
          query: {
            startDate: startDate.format('MM/DD/YYYY'),
            endDate: endDate.format('MM/DD/YYYY'),
          },
        },
      })
      return data!
    }
    async function loadGlassesIfChanged() {
      if (!isRefreshingGlasses.value) await refreshGlasses(false)
    }
    async function loadGlasses() {
      await refreshGlasses(true)
    }
    async function refreshGlasses(force: boolean) {
      controllerGetAll.abort()
      const controller = new AbortController()
      controllerGetAll = controller
      const site = rootStore.reimsSite
      isRefreshingGlasses.value = true
      try {
        const known = force ? '' : allGlassesHash.value
        const { data, response } = await api.GET('/api/glasses/{location}/all', {
          params: { path: { location: site } },
          headers: known ? { 'If-None-Match': known } : {},
          signal: controller.signal,
          fetch: fetchWithin(60000),
        })
        if (response.status !== 304) {
          allGlasses.value = data!
          // queued changes aren't on the server yet
          for (const entry of outbox.queue.value)
            if (entry.glasses.location === site) updateCache(entry)
        }
        allGlassesHash.value = response.headers.get('ETag') ?? ''
        lastRefresh.value = new Date().toISOString()
        isOutdated.value = false
      } finally {
        if (controllerGetAll === controller) isRefreshingGlasses.value = false
      }
    }
    // the server's version replaces the cached copy and a pair that held its SKU before
    function addOfflineGlasses(glasses: Glasses) {
      const cached = allGlasses.value.find((el) => el.id === glasses.id)
      if (cached && JSON.stringify(cached) === JSON.stringify(glasses)) return
      allGlasses.value = [
        ...allGlasses.value.filter((el) => el.id !== glasses.id && el.sku !== glasses.sku),
        glasses,
      ]
    }
    // only replaces the array when something matches, every replacement is persisted
    function removeCached(match: (glasses: Glasses) => boolean) {
      if (allGlasses.value.some(match)) allGlasses.value = allGlasses.value.filter((g) => !match(g))
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
      uploadPending,
      loadSearchesCsv,
      loadDispensedCsv,
      loadInventoryCsv,
      getDispensedGlasses,
      loadGlassesIfChanged,
      loadGlasses,
    }
  },
  { persist: { pick: ['allGlasses', 'lastRefresh', 'allGlassesHash', 'isOutdated'] } },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlassesStore, import.meta.hot))
}
