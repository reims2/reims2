import { createPinia, setActivePinia } from 'pinia'
import { useGlassesStore } from '@/stores/glasses'
import { useAuthStore } from '@/stores/auth'
import { useRootStore } from '@/stores/root'
import { ApiError } from '@/lib/api'
import * as outbox from '@/lib/outbox'
import { Glasses } from '@/model/GlassesModel'
import { createGlasses, stubWebLocks } from './util'

stubWebLocks()

const api = vi.hoisted(() => ({ GET: vi.fn(), POST: vi.fn(), PUT: vi.fn() }))
vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  useApi: () => api,
}))

const eye = { sphere: 1, cylinder: 0, axis: 0, add: 0 }
function pair(id: number, sku: number | null): Glasses {
  return { ...createGlasses('single', eye, eye)[0], id, sku }
}
const allGlasses = (etag: string, data: Glasses[]) => ({
  data,
  response: new Response(null, { headers: { ETag: etag } }),
})
const notModified = (etag: string) => ({
  response: new Response(null, { status: 304, headers: { ETag: etag } }),
})
const dispenseOf = (previousSku: number) => ({
  previousSku,
  modifyDate: null,
  dispenseReason: 'DISPENSED' as const,
})

describe('glasses store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    outbox.queue.value = []
  })

  it('replaces a cached pair when its SKU is reissued to a new pair', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.POST.mockResolvedValue({ data: pair(2, 5) })
    await store.addGlasses(pair(0, null))
    expect(store.allGlasses.map((g) => g.id)).toEqual([2])
    expect(api.POST).toHaveBeenCalledWith('/api/glasses', {
      body: expect.objectContaining({ location: 'sa' }),
    })
  })

  it('evicts a pair the server no longer has', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.GET.mockRejectedValue(new ApiError('Error 404', 404))
    await expect(store.fetchSingle(5)).rejects.toThrow()
    expect(store.getGlassLocal(5)).toBeNull()
    expect(store.getGlassLocal(6)).not.toBeNull()
  })

  it('keeps the cached pair when fetching fails for another reason', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.GET.mockRejectedValue(new ApiError('Network error'))
    await expect(store.fetchSingle(5)).rejects.toThrow()
    expect(store.getGlassLocal(5)).not.toBeNull()
  })

  it('refreshes a pair from the server', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.GET.mockResolvedValue({ data: { ...pair(1, 5), appearance: 'feminine' } })
    await store.fetchSingle(5)
    expect(store.getGlassLocal(5)?.appearance).toBe('feminine')
    expect(store.allGlasses).toHaveLength(1)
  })

  it('sends its ETag and keeps the cache on a 304', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    store.allGlassesHash = '"abc"'
    api.GET.mockResolvedValueOnce(notModified('"abc"'))
    await store.loadGlassesIfChanged()
    expect(api.GET).toHaveBeenCalledWith(
      '/api/glasses/{location}/all',
      expect.objectContaining({
        headers: { 'If-None-Match': '"abc"' },
      }),
    )
    expect(store.allGlasses).toEqual([pair(1, 5)])

    api.GET.mockResolvedValueOnce(allGlasses('"def"', [pair(2, 6)]))
    await store.loadGlassesIfChanged()
    expect(store.allGlasses).toEqual([pair(2, 6)])
    expect(store.allGlassesHash).toBe('"def"')
    expect(store.isOutdated).toBe(false)
    expect(store.isRefreshingGlasses).toBe(false)
  })

  it('loads everything without its ETag when forced', async () => {
    const store = useGlassesStore()
    store.allGlassesHash = '"abc"'
    api.GET.mockResolvedValueOnce(allGlasses('"abc"', [pair(1, 5)]))
    await store.loadGlasses()
    expect(api.GET).toHaveBeenCalledWith(
      '/api/glasses/{location}/all',
      expect.objectContaining({ headers: {} }),
    )
    expect(store.allGlasses).toHaveLength(1)
  })

  it('reloads every time when the server sends no ETag', async () => {
    const store = useGlassesStore()
    store.allGlassesHash = '"abc"'
    api.GET.mockResolvedValueOnce({ data: [pair(1, 5)], response: new Response(null) })
    await store.loadGlassesIfChanged()
    expect(store.allGlassesHash).toBe('')
  })

  it('keeps the old ETag when loading all glasses fails', async () => {
    const store = useGlassesStore()
    store.allGlassesHash = '"abc"'
    api.GET.mockRejectedValueOnce(new ApiError('Network error'))
    await expect(store.loadGlassesIfChanged()).rejects.toThrow()
    expect(store.allGlassesHash).toBe('"abc"')
    expect(store.isRefreshingGlasses).toBe(false)
  })

  it('removes dispensed pairs and restores undispensed ones', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.PUT.mockResolvedValue({})

    expect(await store.dispense(pair(1, 5), 'DISPENSED')).toBe('sent')
    expect(api.PUT).toHaveBeenCalledWith('/api/glasses/{id}/dispense', {
      params: { path: { id: 1 }, query: { reason: 'DISPENSED' } },
    })
    await store.dispense(pair(2, 6), 'WRONGLY_ADDED')
    expect(store.allGlasses).toEqual([])

    api.PUT.mockResolvedValue({ data: pair(1, 5) })
    expect(await store.undispense(pair(1, null))).toBe('sent')
    await store.undispense(pair(1, null))
    expect(api.PUT).toHaveBeenLastCalledWith('/api/glasses/{id}/undispense', {
      params: { path: { id: 1 } },
    })
    expect(store.allGlasses).toEqual([pair(1, 5)])

    // already in stock, so the cache gets the pair back under its previous SKU
    api.PUT.mockResolvedValue({ data: undefined })
    await store.undispense({ ...pair(2, null), dispense: dispenseOf(6) })
    expect(store.getGlassLocal(6)?.id).toBe(2)
  })

  it('queues a change without a response and applies it locally', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.PUT.mockRejectedValue(new ApiError('Network error'))
    expect(await store.dispense(pair(1, 5), 'DISPENSED')).toBe('queued')
    expect(store.getGlassLocal(5)).toBeNull()
    expect(store.pendingCount).toBe(1)
  })

  it('queues reactive glasses', async () => {
    const store = useGlassesStore()
    const dispensed = reactive({ ...pair(1, null), dispense: dispenseOf(5) })
    api.PUT.mockRejectedValue(new ApiError('Network error'))
    expect(await store.undispense(dispensed)).toBe('queued')
    expect(store.getGlassLocal(5)?.id).toBe(1)
  })

  it('uploads a queued dispense with the id it was queued for', async () => {
    useAuthStore().accessToken = 'token'
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.PUT.mockRejectedValueOnce(new ApiError('Network error'))
    expect(await store.dispense(pair(1, 5), 'DISPENSED')).toBe('queued')

    api.PUT.mockClear()
    api.PUT.mockResolvedValue({})
    await store.uploadPending()
    expect(api.PUT).toHaveBeenCalledExactlyOnceWith('/api/glasses/{id}/dispense', {
      params: { path: { id: 1 }, query: { reason: 'DISPENSED' } },
    })
    expect(store.pendingCount).toBe(0)
  })

  it('queues behind waiting changes without trying to send', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.PUT.mockRejectedValueOnce(new ApiError('Network error'))
    await store.dispense(pair(1, 5), 'DISPENSED')
    expect(await store.dispense(pair(2, 6), 'DISPENSED')).toBe('queued')
    expect(api.PUT).toHaveBeenCalledTimes(1)
    expect(store.pendingCount).toBe(2)
  })

  it('throws on a server error without changing the cache', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.PUT.mockRejectedValue(new ApiError('Server error', 502))
    await expect(store.dispense(pair(1, 5), 'DISPENSED')).rejects.toThrow()
    expect(store.getGlassLocal(5)).not.toBeNull()
    expect(store.pendingCount).toBe(0)
  })

  it('reloads everything at the next poll after a queued change was rejected', async () => {
    useAuthStore().accessToken = 'token'
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    store.allGlassesHash = 'abc'
    api.PUT.mockRejectedValueOnce(new ApiError('Network error'))
    await store.dispense(pair(1, 5), 'DISPENSED')

    api.PUT.mockRejectedValue(new ApiError('Error 409', 409, 'conflict'))
    await store.uploadPending()
    expect(store.pendingCount).toBe(0)
    expect(store.allGlassesHash).toBe('')
  })

  it('replaces an edited pair with the server version', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.PUT.mockResolvedValue({ data: { ...pair(1, 5), glassesSize: 'large' } })
    await store.editGlasses({ ...pair(1, 5), glassesSize: 'large' })
    expect(api.PUT).toHaveBeenCalledWith(
      '/api/glasses/{id}',
      expect.objectContaining({ params: { path: { id: 1 } } }),
    )
    expect(store.allGlasses).toHaveLength(1)
    expect(store.getGlassLocal(5)?.glassesSize).toBe('large')
  })

  it('evicts a pair the server says was dispensed or is gone', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.PUT.mockRejectedValue(new ApiError('Error 409', 409, 'dispensed'))
    await expect(store.editGlasses(pair(1, 5))).rejects.toThrow('dispensed')
    expect(store.allGlasses).toEqual([pair(2, 6)])
  })

  it('keeps queued changes applied after a full load', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.PUT.mockRejectedValue(new ApiError('Network error'))
    await store.dispense(pair(1, 5), 'DISPENSED')

    api.GET.mockResolvedValueOnce(allGlasses('"def"', [pair(1, 5), pair(2, 6)]))
    await store.loadGlasses()
    expect(store.allGlasses).toEqual([pair(2, 6)])
  })

  describe('search log', () => {
    const od = { sphere: -2, cylinder: -0.5, axis: 90, add: 0, isBAL: false }
    const os = { sphere: 1, cylinder: 0, axis: 0, add: 0, isBAL: false }

    beforeEach(() => {
      vi.useFakeTimers({ now: new Date('2026-01-15T18:30:00Z') })
      useRootStore().reimsSite = 'sm'
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('sends the search with its result count and shown results', async () => {
      const results = [{ id: 4, algorithm: 'blurscore' }]
      await useGlassesStore().logSearch(
        { glassesType: 'multifocal', od, os, highTolerance: true },
        3,
        results,
      )
      expect(api.POST).toHaveBeenCalledWith('/api/glasses/{location}/searchLog', {
        params: { path: { location: 'sm' } },
        body: expect.objectContaining({
          glassesType: 'multifocal',
          od: expect.objectContaining({ sphere: -2, cylinder: -0.5, axis: 90, add: 0 }),
          os: expect.objectContaining({ sphere: 1, cylinder: 0, axis: 0, add: 0 }),
          balLens: 'DISABLE_NONE',
          increaseSearchTolerance: true,
          searchDate: Date.parse('2026-01-15T18:30:00Z'),
          resultCount: 3,
          results,
        }),
      })
    })

    it.each([
      ['od', 'DISABLE_OD'],
      ['os', 'DISABLE_OS'],
    ] as const)('marks a BAL lens on %s as %s', async (eyeName, balLens) => {
      const search = { glassesType: 'single' as const, od, os, [eyeName]: { ...od, isBAL: true } }
      await useGlassesStore().logSearch(search, 0, [])
      expect(api.POST).toHaveBeenCalledWith('/api/glasses/{location}/searchLog', {
        params: { path: { location: 'sm' } },
        body: expect.objectContaining({ balLens, increaseSearchTolerance: false, resultCount: 0 }),
      })
    })
  })
})
