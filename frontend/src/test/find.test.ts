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
