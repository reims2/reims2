import { createTestingPinia } from '@pinia/testing'
import { ref } from 'vue'
import { useDispenseResult, useFindGlasses } from '@/composables/find'
import { GlassesInput, GlassesResult } from '@/model/GlassesModel'
import { useGlassesStore } from '@/stores/glasses'
import { createGlassesEqualOdOs } from './util'

function search(sphere: string) {
  const eye = { sphere, cylinder: '', axis: '', add: '', isBAL: false }
  const input = ref<GlassesInput>({ glassesType: 'single', od: { ...eye }, os: { ...eye } })
  const { matches, startSearch } = useFindGlasses(input, false, true)
  startSearch()
  return matches.value
}

describe('useFindGlasses', () => {
  beforeEach(() => {
    createTestingPinia()
    const glassesStore = useGlassesStore()
    glassesStore.allGlasses = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    vi.mocked(glassesStore.logSearch).mockResolvedValue()
  })

  it('logs a search with matches', () => {
    expect(search('-2')).toHaveLength(1)
    expect(useGlassesStore().logSearch).toHaveBeenCalledWith(
      expect.objectContaining({ glassesType: 'single' }),
      1,
    )
  })

  it('logs a search without matches', () => {
    expect(search('5')).toHaveLength(0)
    expect(useGlassesStore().logSearch).toHaveBeenCalledWith(
      expect.objectContaining({ glassesType: 'single' }),
      0,
    )
  })
})

describe('useDispenseResult', () => {
  const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
  const result: GlassesResult = {
    ...glasses,
    id: 7,
    sku: 1234,
    score: 1,
    odScore: 0.5,
    osScore: 0.5,
  }

  beforeEach(() => createTestingPinia())

  it('keeps a dispensed result listed as dispensed', async () => {
    const { shown, dispense } = useDispenseResult(ref([result]))
    await dispense(result)
    expect(useGlassesStore().dispense).toHaveBeenCalledWith(1234, 'DISPENSED')
    expect(shown(result)).toMatchObject({
      sku: null,
      dispensed: true,
      dispense: { previousSku: 1234, dispenseReason: 'DISPENSED' },
    })
  })

  it('undoes a dispense with the previous SKU', async () => {
    const { shown, dispense, undo } = useDispenseResult(ref([result]))
    await dispense(result)
    await undo(result)
    expect(useGlassesStore().undispense).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, dispense: expect.objectContaining({ previousSku: 1234 }) }),
    )
    expect(shown(result)).toBe(result)
  })

  it('forgets dispensed results on a new search', async () => {
    const matches = ref<GlassesResult[] | null>([result])
    const { shown, dispense } = useDispenseResult(matches)
    await dispense(result)
    matches.value = [result]
    await nextTick()
    expect(shown(result)).toBe(result)
  })
})
