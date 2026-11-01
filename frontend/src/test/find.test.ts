import { createTestingPinia } from '@pinia/testing'
import { ref } from 'vue'
import { useDispenseResult, useFindGlasses } from '@/composables/find'
import { GlassesInput } from '@/model/GlassesModel'
import { MatchResult } from '@/lib/interleave'
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
    // for an Rx of +2, PhilScore ranks 2.5 third but blurscore predicts less blur for 1.75
    glassesStore.allGlasses = [2, 2.25, 1.75, 2.5].map((sphere, i) => ({
      ...createGlassesEqualOdOs('single', { sphere, cylinder: 0, axis: 0 })[0],
      id: i + 1,
      sku: i + 1,
    }))
    vi.mocked(glassesStore.logSearch).mockResolvedValue()
  })

  it('shows an alternative and logs which algorithm placed each pair', () => {
    expect(search('2')?.map(({ id, algorithm }) => [id, algorithm])).toEqual([
      [1, 'philscore'],
      [2, 'philscore'],
      [3, 'blurscore'],
      [4, 'philscore'],
    ])
    expect(useGlassesStore().logSearch).toHaveBeenCalledWith(
      expect.objectContaining({ glassesType: 'single' }),
      4,
      [
        { id: 1, algorithm: 'philscore' },
        { id: 2, algorithm: 'philscore' },
        { id: 3, algorithm: 'blurscore' },
        { id: 4, algorithm: 'philscore' },
      ],
    )
  })

  it('logs a search without matches', () => {
    expect(search('-5')).toHaveLength(0)
    expect(useGlassesStore().logSearch).toHaveBeenCalledWith(
      expect.objectContaining({ glassesType: 'single' }),
      0,
      [],
    )
  })
})

describe('useDispenseResult', () => {
  const [glasses] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
  const result: MatchResult = {
    ...glasses,
    id: 7,
    sku: 1234,
    algorithm: 'philscore',
    score: 1,
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
    const matches = ref<MatchResult[] | null>([result])
    const { shown, dispense } = useDispenseResult(matches)
    await dispense(result)
    matches.value = [result]
    await nextTick()
    expect(shown(result)).toBe(result)
  })
})
