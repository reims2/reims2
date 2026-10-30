import { createTestingPinia } from '@pinia/testing'
import { useAddGlasses } from '@/composables/add'
import { toastQueue } from '@/composables/toast'
import { ReimsAxiosError } from '@/lib/axios'
import { GlassesInput } from '@/model/GlassesModel'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'
import { createGlassesEqualOdOs } from './util'

function input(): Ref<GlassesInput> {
  const eye = { sphere: '1.1', cylinder: '0.5', axis: '180', add: '' }
  return ref({
    glassesType: 'single',
    appearance: 'neutral',
    glassesSize: 'medium',
    od: { ...eye },
    os: { ...eye },
  })
}

describe('useAddGlasses', () => {
  beforeEach(() => {
    createTestingPinia()
    toastQueue.value = []
  })

  it('rejects missing required fields without calling the server', async () => {
    const glasses = input()
    glasses.value.appearance = ''
    const onSuccess = vi.fn()
    await useAddGlasses(glasses, onSuccess).submit()
    expect(useGlassesStore().addGlasses).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(toastQueue.value).toEqual([
      { color: 'error', timeout: -1, text: 'Please fill in all required fields' },
    ])
  })

  it('sends sanitized eyes and remembers the new SKU', async () => {
    const glassesStore = useGlassesStore()
    const [added] = createGlassesEqualOdOs('single', { sphere: 1.25, cylinder: -0.5, axis: 0 })
    added.sku = 42
    vi.mocked(glassesStore.addGlasses).mockResolvedValue(added)
    const onSuccess = vi.fn()

    await useAddGlasses(input(), onSuccess).submit()

    const eye = { sphere: 1.25, cylinder: -0.5, axis: 0, add: 0 }
    expect(glassesStore.addGlasses).toHaveBeenCalledWith({
      glassesType: 'single',
      appearance: 'neutral',
      glassesSize: 'medium',
      od: eye,
      os: eye,
    })
    expect(useRootStore().lastAddedSkus).toEqual([42])
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows why the server refused the glasses', async () => {
    vi.mocked(useGlassesStore().addGlasses).mockRejectedValue(
      new ReimsAxiosError('Error 409', false, false, 'No free SKUs left in this location.', 409),
    )
    const onSuccess = vi.fn()
    await useAddGlasses(input(), onSuccess).submit()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(toastQueue.value).toEqual([
      { color: 'error', timeout: -1, text: 'No free SKUs left in this location.' },
    ])
  })

  it('asks to retry on a server error', async () => {
    vi.mocked(useGlassesStore().addGlasses).mockRejectedValue(
      new ReimsAxiosError('Server error', false, true, null, 500),
    )
    const { submit, loading } = useAddGlasses(input())
    await submit()
    expect(loading.value).toBe(false)
    expect(toastQueue.value).toEqual([
      { color: 'error', timeout: -1, text: 'Could not add glasses, please retry (Server error)' },
    ])
  })

  it('lists recently added glasses and forgets deleted ones', async () => {
    const glassesStore = useGlassesStore()
    const rootStore = useRootStore()
    const eye = { sphere: 1, cylinder: 0, axis: 0 }
    const [first] = createGlassesEqualOdOs('single', eye)
    const [second] = createGlassesEqualOdOs('single', eye)
    second.sku = 2
    glassesStore.allGlasses = [first, second]
    rootStore.lastAddedSkus = [2, 1]

    const { lastAdded, freeSlots } = useAddGlasses(input())
    expect(lastAdded.value.map((g) => g.sku)).toEqual([2, 1])
    expect(freeSlots.value).toBe(4998)

    glassesStore.allGlasses = [first]
    await nextTick()
    expect(rootStore.lastAddedSkus).toEqual([1])
  })
})
