import 'fake-indexeddb/auto'
import { createPinia, setActivePinia } from 'pinia'
import { useGlassesStore } from '@/stores/glasses'
import { useAuthStore } from '@/stores/auth'
import { useRootStore } from '@/stores/root'
import { ReimsAxiosError } from '@/lib/axios'
import * as outbox from '@/lib/outbox'
import { Glasses } from '@/model/GlassesModel'
import { createGlasses, stubWebLocks } from './util'

stubWebLocks()

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }))
vi.mock('@/lib/axios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/axios')>()),
  useAxios: () => api,
}))

const eye = { sphere: 1, cylinder: 0, axis: 0, add: 0 }
function pair(id: number, sku: number | null): Glasses {
  return { ...createGlasses('single', eye, eye)[0], id, sku }
}
const dispenseOf = (previousSku: number) => ({
  previousSku,
  modifyDate: 0,
  dispenseReason: 'DISPENSED' as const,
})

describe('glasses store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    await outbox.flush(async () => {})
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

    expect(await store.dispense(5, 'DISPENSED')).toBe('sent')
    expect(api.put).toHaveBeenCalledWith('/api/glasses/dispense/sa/5?reason=DISPENSED', {})
    await store.deleteGlasses(6)
    expect(store.allGlasses).toEqual([])

    const dispensed = { ...pair(1, null), dispense: dispenseOf(5) }
    expect(await store.undispense(dispensed)).toBe('sent')
    expect(api.put).toHaveBeenLastCalledWith('/api/glasses/undispense/1', {})
    expect(store.getGlassLocal(5)?.id).toBe(1)
    expect(store.getGlassLocal(5)?.dispense).toBeUndefined()
  })

  it('queues a change without a response and applies it locally', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockRejectedValue(new ReimsAxiosError('Network error', true))
    expect(await store.dispense(5, 'DISPENSED')).toBe('queued')
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

  it('queues behind waiting changes without trying to send', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5), pair(2, 6)]
    api.put.mockRejectedValueOnce(new ReimsAxiosError('Network error', true))
    await store.dispense(5, 'DISPENSED')
    expect(await store.dispense(6, 'DISPENSED')).toBe('queued')
    expect(api.put).toHaveBeenCalledTimes(1)
    expect(store.pendingCount).toBe(2)
  })

  it('throws on a server error without changing the cache', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockRejectedValue(new ReimsAxiosError('Server error', false, true, null, 502))
    await expect(store.dispense(5, 'DISPENSED')).rejects.toThrow()
    expect(store.getGlassLocal(5)).not.toBeNull()
    expect(store.pendingCount).toBe(0)
  })

  it('uploads queued changes to the site they were made at', async () => {
    const store = useGlassesStore()
    useAuthStore().accessToken = 'token'
    api.put.mockRejectedValueOnce(new ReimsAxiosError('Network error', true))
    await store.dispense(5, 'DISPENSED')
    useRootStore().reimsSite = 'sm'

    api.put.mockResolvedValue({})
    await store.uploadPending()
    expect(api.put).toHaveBeenLastCalledWith('/api/glasses/dispense/sa/5?reason=DISPENSED', {})
    expect(store.pendingCount).toBe(0)
  })

  it('replaces an edited pair with the server version', async () => {
    const store = useGlassesStore()
    store.allGlasses = [pair(1, 5)]
    api.put.mockResolvedValue({ data: { ...pair(1, 5), glassesSize: 'large' } })
    await store.editGlasses({ ...pair(1, 5), glassesSize: 'large' })
    expect(store.allGlasses).toHaveLength(1)
    expect(store.getGlassLocal(5)?.glassesSize).toBe('large')
  })
})
