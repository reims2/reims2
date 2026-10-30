import { createPinia, setActivePinia } from 'pinia'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import { ReimsAxiosError } from '@/lib/axios'
import { Glasses } from '@/model/GlassesModel'
import { createGlasses } from './util'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }))
vi.mock('@/lib/axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/axios')>()),
  useAxios: () => api,
}))

const eye = { sphere: 1, cylinder: 0, axis: 0, add: 0 }
function pair(id: number, sku: number | null): Glasses {
  return { ...createGlasses('single', eye, eye)[0], id, sku }
}

describe('glasses store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
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

  it('only loads all glasses when the change hash moved', async () => {
    const store = useGlassesStore()
    store.allGlassesHash = 'abc'
    api.get.mockResolvedValueOnce({ data: { hashValue: 'abc' } })
    await store.loadGlassesIfChanged()
    expect(api.get).toHaveBeenCalledTimes(1)

    api.get
      .mockResolvedValueOnce({ data: { hashValue: 'def' } })
      .mockResolvedValueOnce({ data: [pair(1, 5)] })
    await store.loadGlassesIfChanged()
    expect(api.get).toHaveBeenLastCalledWith('/api/glasses/sa/all', expect.anything())
    expect(store.allGlasses).toHaveLength(1)
    expect(store.allGlassesHash).toBe('def')
    expect(store.isOutdated).toBe(false)
    expect(store.isRefreshingGlasses).toBe(false)
  })

  it('keeps the old hash when loading all glasses fails', async () => {
    const store = useGlassesStore()
    store.allGlassesHash = 'abc'
    api.get
      .mockResolvedValueOnce({ data: { hashValue: 'def' } })
      .mockRejectedValueOnce(new ReimsAxiosError('Network error', true))
    await expect(store.loadGlassesIfChanged()).rejects.toThrow()
    expect(store.allGlassesHash).toBe('abc')
    expect(store.isRefreshingGlasses).toBe(false)
  })

  it('removes dispensed and deleted pairs and restores undispensed ones', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.put.mockResolvedValue({})
    api.delete.mockResolvedValue({})

    await store.dispense(5, 'DISPENSED')
    expect(api.put).toHaveBeenCalledWith('/api/glasses/dispense/sa/5?reason=DISPENSED&id=1', {})
    await store.deleteGlasses(6)
    expect(store.allGlasses).toEqual([])

    await store.undispense(pair(1, 5))
    expect(api.put).toHaveBeenLastCalledWith('/api/glasses/undispense/1', {})
    expect(store.getGlassLocal(5)?.id).toBe(1)
  })

  it('does not change the cache when a write fails', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockRejectedValue(new ReimsAxiosError('Network error', true))
    await expect(store.dispense(5, 'DISPENSED')).rejects.toThrow()
    expect(store.getGlassLocal(5)).not.toBeNull()
  })

  it('replaces an edited pair with the server version', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockResolvedValue({ data: { ...pair(1, 5), glassesSize: 'large' } })
    await store.editGlasses({ ...pair(1, 5), glassesSize: 'large' })
    expect(store.allGlasses).toHaveLength(1)
    expect(store.getGlassLocal(5)?.glassesSize).toBe('large')
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

    it('sends the search with its result count', async () => {
      await useGlassesStore().logSearch(
        { glassesType: 'multifocal', od, os, highTolerance: true },
        3,
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
        }),
      )
    })

    it.each([
      ['od', 'DISABLE_OD'],
      ['os', 'DISABLE_OS'],
    ] as const)('marks a BAL lens on %s as %s', async (eyeName, balLens) => {
      const search = { glassesType: 'single' as const, od, os, [eyeName]: { ...od, isBAL: true } }
      await useGlassesStore().logSearch(search, 0)
      expect(api.post).toHaveBeenCalledWith(
        '/api/glasses/sm/searchLog',
        expect.objectContaining({ balLens, increaseSearchTolerance: false, resultCount: 0 }),
      )
    })
  })
})
