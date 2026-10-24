import { createTestingPinia } from '@pinia/testing'
import { ref } from 'vue'
import { useFindGlasses } from '@/composables/find'
import { GlassesInput } from '@/model/GlassesModel'
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
    const [pair] = createGlassesEqualOdOs('single', { sphere: -2, cylinder: 0, axis: 0 })
    // only blurscore finds this one for an Rx of -2
    const [blurOnly] = createGlassesEqualOdOs('single', { sphere: -2.75, cylinder: 0, axis: 0 })
    glassesStore.allGlasses = [pair, { ...blurOnly, id: 2, sku: 2 }]
    vi.mocked(glassesStore.logSearch).mockResolvedValue()
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('interleaves both algorithms and logs which placed each pair', () => {
    expect(search('-2')).toMatchObject([
      { id: 1, algorithm: 'philscore', score: 0, grade: 'excellent' },
      { id: 2, algorithm: 'blurscore', score: undefined, grade: 'fair' },
    ])
    expect(useGlassesStore().logSearch).toHaveBeenCalledWith(
      expect.objectContaining({ glassesType: 'single' }),
      1,
      [
        { id: 1, sku: 1, algorithm: 'philscore' },
        { id: 2, sku: 2, algorithm: 'blurscore' },
      ],
    )
  })

  it('lets the coin decide who adds first', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    expect(search('-2')?.[0]).toMatchObject({ id: 1, algorithm: 'blurscore' })
  })

  it('logs a search without matches', () => {
    expect(search('5')).toHaveLength(0)
    expect(useGlassesStore().logSearch).toHaveBeenCalledWith(
      expect.objectContaining({ glassesType: 'single' }),
      0,
      [],
    )
  })
})
