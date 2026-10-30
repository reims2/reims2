import { fireEvent, within } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import ViewGlasses from '@/views/ViewGlasses.vue'
import { Glasses } from '@/model/GlassesModel'
import { createGlasses, renderWithVuetify } from './util'

function pair(sku: number, odSphere: number, creationDate: string): Glasses {
  const eye = { sphere: odSphere, cylinder: 0, axis: 0, add: 0 }
  return { ...createGlasses('single', eye, eye)[0], id: sku, sku, creationDate }
}

// chosen so that sorting the displayed DD.MM.YYYY text would give a different order
const glasses = [
  pair(1, 1.5, '2020-01-05T00:00:00.000+00:00'),
  pair(2, -2, '2018-12-20T00:00:00.000+00:00'),
  pair(3, 0.25, '2024-03-10T00:00:00.000+00:00'),
]

function renderView() {
  const pinia = createTestingPinia({ initialState: { glasses: { allGlasses: glasses } } })
  const wrapper = renderWithVuetify(ViewGlasses, {}, pinia)
  const skus = () =>
    within(wrapper.getAllByRole('rowgroup')[1])
      .getAllByRole('row')
      .map((row) => within(row).getAllByRole('cell')[0].textContent)
  const sortBy = (title: string) => fireEvent.click(wrapper.getByText(title, { selector: 'span' }))
  return { skus, sortBy }
}

describe('ViewGlasses', () => {
  it('sorts by SKU by default', () => {
    expect(renderView().skus()).toEqual(['0001', '0002', '0003'])
  })

  it('sorts the added column chronologically', async () => {
    const { skus, sortBy } = renderView()
    await sortBy('Added')
    expect(skus()).toEqual(['0002', '0001', '0003'])
    await sortBy('Added')
    expect(skus()).toEqual(['0003', '0001', '0002'])
  })

  it('sorts diopters numerically', async () => {
    const { skus, sortBy } = renderView()
    await sortBy('OD SPH')
    expect(skus()).toEqual(['0002', '0003', '0001'])
  })
})
