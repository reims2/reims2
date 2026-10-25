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
        { id: 1, sku: 1, algorithm: 'philscore' },
        { id: 2, sku: 2, algorithm: 'philscore' },
        { id: 3, sku: 3, algorithm: 'blurscore' },
        { id: 4, sku: 4, algorithm: 'philscore' },
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
