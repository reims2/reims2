import { createPinia, setActivePinia } from 'pinia'
import { useGlassesStore } from '@/stores/glasses'
import { useAuthStore } from '@/stores/auth'
import { useRootStore } from '@/stores/root'
import { ReimsAxiosError } from '@/lib/axios'
import * as outbox from '@/lib/outbox'
import { Glasses } from '@/model/GlassesModel'
import { createGlasses, stubWebLocks } from './util'

stubWebLocks()

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }))
vi.mock('@/lib/axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/axios')>()),
  useAxios: () => api,
}))

const eye = { sphere: 1, cylinder: 0, axis: 0, add: 0 }
function pair(id: number, sku: number | null): Glasses {
  return { ...createGlasses('single', eye, eye)[0], id, sku }
}
const allGlasses = (etag: string, data: Glasses[]) => ({ status: 200, data, headers: { etag } })
const notModified = (etag: string) => ({ status: 304, data: '', headers: { etag } })
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
    api.post.mockResolvedValue({ data: pair(2, 5) })
    await store.addGlasses(pair(0, null))
    expect(store.allGlasses.map((g) => g.id)).toEqual([2])
    expect(api.post).toHaveBeenCalledWith(
      '/api/glasses',
      expect.objectContaining({ location: 'sa' }),
    )
  })

  it('evicts a pair the server no longer has', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.get.mockRejectedValue(new ReimsAxiosError('Error 404', false, false, null, 404))
    await expect(store.fetchSingle(5)).rejects.toThrow()
    expect(store.getGlassLocal(5)).toBeNull()
    expect(store.getGlassLocal(6)).not.toBeNull()
  })

  it('keeps the cached pair when fetching fails for another reason', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.get.mockRejectedValue(new ReimsAxiosError('Network error', true))
    await expect(store.fetchSingle(5)).rejects.toThrow()
    expect(store.getGlassLocal(5)).not.toBeNull()
  })

  it('refreshes a pair from the server', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.get.mockResolvedValue({ data: { ...pair(1, 5), appearance: 'feminine' } })
    await store.fetchSingle(5)
    expect(store.getGlassLocal(5)?.appearance).toBe('feminine')
    expect(store.allGlasses).toHaveLength(1)
  })

  it('sends its ETag and keeps the cache on a 304', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    store.allGlassesHash = '"abc"'
    api.get.mockResolvedValueOnce(notModified('"abc"'))
    await store.loadGlassesIfChanged()
    expect(api.get).toHaveBeenCalledWith(
      '/api/glasses/sa/all',
      expect.objectContaining({ headers: { 'If-None-Match': '"abc"' } }),
    )
    expect(store.allGlasses).toEqual([pair(1, 5)])

    api.get.mockResolvedValueOnce(allGlasses('"def"', [pair(2, 6)]))
    await store.loadGlassesIfChanged()
    expect(store.allGlasses).toEqual([pair(2, 6)])
    expect(store.allGlassesHash).toBe('"def"')
    expect(store.isOutdated).toBe(false)
    expect(store.isRefreshingGlasses).toBe(false)
  })

  it('accepts a 304 but no other non-2xx status', async () => {
    const store = useGlassesStore()
    api.get.mockResolvedValueOnce(notModified('"abc"'))
    await store.loadGlassesIfChanged()
    const { validateStatus } = api.get.mock.calls[0][1]
    expect([200, 204, 304].map(validateStatus)).toEqual([true, true, true])
    expect([301, 404, 500].map(validateStatus)).toEqual([false, false, false])
  })

  it('loads everything without its ETag when forced', async () => {
    const store = useGlassesStore()
    store.allGlassesHash = '"abc"'
    api.get.mockResolvedValueOnce(allGlasses('"abc"', [pair(1, 5)]))
    await store.loadGlasses()
    expect(api.get).toHaveBeenCalledWith(
      '/api/glasses/sa/all',
      expect.objectContaining({ headers: {} }),
    )
    expect(store.allGlasses).toHaveLength(1)
  })

  it('reloads every time when the server sends no ETag', async () => {
    const store = useGlassesStore()
    store.allGlassesHash = '"abc"'
    api.get.mockResolvedValueOnce({ status: 200, data: [pair(1, 5)], headers: {} })
    await store.loadGlassesIfChanged()
    expect(store.allGlassesHash).toBe('')
  })

  it('keeps the old ETag when loading all glasses fails', async () => {
    const store = useGlassesStore()
    store.allGlassesHash = '"abc"'
    api.get.mockRejectedValueOnce(new ReimsAxiosError('Network error', true))
    await expect(store.loadGlassesIfChanged()).rejects.toThrow()
    expect(store.allGlassesHash).toBe('"abc"')
    expect(store.isRefreshingGlasses).toBe(false)
  })

  it('removes dispensed pairs and restores undispensed ones', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.put.mockResolvedValue({})

    expect(await store.dispense(pair(1, 5), 'DISPENSED')).toBe('sent')
    expect(api.put).toHaveBeenCalledWith('/api/glasses/1/dispense?reason=DISPENSED', {})
    await store.dispense(pair(2, 6), 'WRONGLY_ADDED')
    expect(store.allGlasses).toEqual([])

    api.put.mockResolvedValue({ status: 200, data: pair(1, 5) })
    expect(await store.undispense(pair(1, null))).toBe('sent')
    await store.undispense(pair(1, null))
    expect(api.put).toHaveBeenLastCalledWith('/api/glasses/1/undispense', {})
    expect(store.allGlasses).toEqual([pair(1, 5)])

    // already in stock, so the cache gets the pair back under its previous SKU
    api.put.mockResolvedValue({ status: 204, data: '' })
    await store.undispense({ ...pair(2, null), dispense: dispenseOf(6) })
    expect(store.getGlassLocal(6)?.id).toBe(2)
  })

  it('queues a change without a response and applies it locally', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockRejectedValue(new ReimsAxiosError('Network error', true))
    expect(await store.dispense(pair(1, 5), 'DISPENSED')).toBe('queued')
    expect(store.getGlassLocal(5)).toBeNull()
    expect(store.pendingCount).toBe(1)
  })

  it('queues reactive glasses', async () => {
    const store = useGlassesStore()
    const dispensed = reactive({ ...pair(1, null), dispense: dispenseOf(5) })
    api.put.mockRejectedValue(new ReimsAxiosError('Network error', true))
    expect(await store.undispense(dispensed)).toBe('queued')
    expect(store.getGlassLocal(5)?.id).toBe(1)
  })

  it('uploads a queued dispense with the id it was queued for', async () => {
    useAuthStore().accessToken = 'token'
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockRejectedValueOnce(new ReimsAxiosError('Network error', true))
    expect(await store.dispense(pair(1, 5), 'DISPENSED')).toBe('queued')

    api.put.mockClear()
    api.put.mockResolvedValue({})
    await store.uploadPending()
    expect(api.put).toHaveBeenCalledExactlyOnceWith('/api/glasses/1/dispense?reason=DISPENSED', {})
    expect(store.pendingCount).toBe(0)
  })

  it('queues behind waiting changes without trying to send', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.put.mockRejectedValueOnce(new ReimsAxiosError('Network error', true))
    await store.dispense(pair(1, 5), 'DISPENSED')
    expect(await store.dispense(pair(2, 6), 'DISPENSED')).toBe('queued')
    expect(api.put).toHaveBeenCalledTimes(1)
    expect(store.pendingCount).toBe(2)
  })

  it('throws on a server error without changing the cache', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockRejectedValue(new ReimsAxiosError('Server error', false, true, null, 502))
    await expect(store.dispense(pair(1, 5), 'DISPENSED')).rejects.toThrow()
    expect(store.getGlassLocal(5)).not.toBeNull()
    expect(store.pendingCount).toBe(0)
  })

  it('reloads everything at the next poll after a queued change was rejected', async () => {
    useAuthStore().accessToken = 'token'
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    store.allGlassesHash = 'abc'
    api.put.mockRejectedValueOnce(new ReimsAxiosError('Network error', true))
    await store.dispense(pair(1, 5), 'DISPENSED')

    api.put.mockRejectedValue(new ReimsAxiosError('Error 409', false, false, 'conflict', 409))
    await store.uploadPending()
    expect(store.pendingCount).toBe(0)
    expect(store.allGlassesHash).toBe('')
  })

  it('replaces an edited pair with the server version', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockResolvedValue({ data: { ...pair(1, 5), glassesSize: 'large' } })
    await store.editGlasses({ ...pair(1, 5), glassesSize: 'large' })
    expect(api.put).toHaveBeenCalledWith('/api/glasses/1', expect.anything())
    expect(store.allGlasses).toHaveLength(1)
    expect(store.getGlassLocal(5)?.glassesSize).toBe('large')
  })

  it('evicts a pair the server says was dispensed or is gone', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.put.mockRejectedValue(new ReimsAxiosError('Error 409', false, false, 'dispensed', 409))
    await expect(store.editGlasses(pair(1, 5))).rejects.toThrow('dispensed')
    expect(store.allGlasses).toEqual([pair(2, 6)])
  })

  it('keeps queued changes applied after a full load', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.put.mockRejectedValue(new ReimsAxiosError('Network error', true))
    await store.dispense(pair(1, 5), 'DISPENSED')

    api.get.mockResolvedValueOnce(allGlasses('"def"', [pair(1, 5), pair(2, 6)]))
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
      expect(api.post).toHaveBeenCalledWith(
        '/api/glasses/sm/searchLog',
        expect.objectContaining({
          glassesType: 'multifocal',
          od: expect.objectContaining({ sphere: -2, cylinder: -0.5, axis: 90, add: 0 }),
          os: expect.objectContaining({ sphere: 1, cylinder: 0, axis: 0, add: 0 }),
          balLens: 'DISABLE_NONE',
          increaseSearchTolerance: true,
          searchDate: Date.parse('2026-01-15T18:30:00Z'),
          resultCount: 3,
          results,
        }),
      )
    })

    it.each([
      ['od', 'DISABLE_OD'],
      ['os', 'DISABLE_OS'],
    ] as const)('marks a BAL lens on %s as %s', async (eyeName, balLens) => {
      const search = { glassesType: 'single' as const, od, os, [eyeName]: { ...od, isBAL: true } }
      await useGlassesStore().logSearch(search, 0, [])
      expect(api.post).toHaveBeenCalledWith(
        '/api/glasses/sm/searchLog',
        expect.objectContaining({ balLens, increaseSearchTolerance: false, resultCount: 0 }),
      )
    })
  })
})
