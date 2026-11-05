import { createTestingPinia } from '@pinia/testing'
import SelectGlassesInput from '@/components/SelectGlassesInput.vue'
import { useGlassesStore } from '@/stores/glasses'
import { Glasses } from '@/model/GlassesModel'
import { createGlasses, renderWithVuetify } from './util'

const eye = { sphere: 1, cylinder: 0, axis: 0, add: 0 }

describe('SelectGlassesInput', () => {
  it('ignores a fetch that finishes after the SKU was cleared', async () => {
    const pinia = createTestingPinia()
    const store = useGlassesStore(pinia)
    let resolveFetch: (glasses: Glasses) => void = () => {}
    vi.mocked(store.fetchSingle).mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)))
    vi.mocked(store.getGlassLocal).mockReturnValue(null)

    const wrapper = renderWithVuetify(
      SelectGlassesInput,
      { props: { sku: null, loading: false } },
      pinia,
    )
    await wrapper.rerender({ sku: 5 })
    await wrapper.rerender({ sku: null })
    resolveFetch({ ...createGlasses('single', eye, eye)[0], sku: 5 })
    await new Promise((r) => setTimeout(r))

    expect(wrapper.emitted('change')).toEqual([[null], [null]])
  })
})
