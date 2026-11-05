import { nextTick } from 'vue'
import SkuTag from '@/components/SkuTag.vue'
import { renderWithVuetify } from './util'

function tag(container: Element) {
  return container.querySelector('.v-sheet') as HTMLElement
}

test('plays the dispense animation when a pair on screen gets dispensed', async () => {
  const view = renderWithVuetify(SkuTag, { props: { sku: '1042', state: 'stock' } })
  expect(tag(view.container).classList.contains('sku-celebrate')).toBe(false)

  await view.rerender({ sku: '1042', state: 'dispensed' })
  expect(tag(view.container).classList.contains('sku-celebrate')).toBe(true)
})

test('plays it for a row that arrives dispensed only when asked to', async () => {
  const quiet = renderWithVuetify(SkuTag, { props: { sku: '0377', state: 'dispensed' } })
  expect(tag(quiet.container).classList.contains('sku-celebrate')).toBe(false)

  const loud = renderWithVuetify(SkuTag, {
    props: { sku: '0377', state: 'dispensed', celebrate: true },
  })
  await nextTick()
  expect(tag(loud.container).classList.contains('sku-celebrate')).toBe(true)
})

test('never plays it for a deletion', async () => {
  const view = renderWithVuetify(SkuTag, {
    props: { sku: '2210', state: 'stock', celebrate: true },
  })
  await view.rerender({ sku: '2210', state: 'deleted', celebrate: true })
  expect(tag(view.container).classList.contains('sku-celebrate')).toBe(false)
  expect(view.getByText('Deleted')).toBeTruthy()
})
