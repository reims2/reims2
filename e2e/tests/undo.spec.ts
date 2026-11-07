import { EyeInput } from './eye-input.po'
import { test, expect, formatSku, lookUpSku, open, searchGlasses, searchResult } from './fixtures'

// a freed SKU goes to the next added pair, so undo needs a site no other spec adds to,
// one browser and one test at a time
test.describe('Undo', { tag: '@one-browser' }, () => {
  test.use({ location: 'sm' })
  test.describe.configure({ mode: 'default' })

  test('Dispense from results', async ({ page, createGlasses }) => {
    const { sku } = await createGlasses({ od: { sphere: -6.5 }, os: { sphere: -6.75 } })
    await open(page, '/find')
    await new EyeInput(page).fill({
      category: 's',
      od: { sphere: '-6.5', cylinder: '0' },
      os: { sphere: '-6.75', cylinder: '0' },
    })
    await searchGlasses(page)

    const result = searchResult(page, sku)
    await result.getByRole('button', { name: 'Dispense' }).click()
    await expect(
      page.getByText(`Successfully dispensed glasses with SKU ${formatSku(sku)}`),
    ).toBeVisible()
    await expect(result.getByText('Dispensed')).toBeVisible()
    await result.getByRole('button', { name: 'Undo' }).click()
    await expect(
      page.getByText(`Reverted dispension/deletion of SKU ${formatSku(sku)}`),
    ).toBeVisible()

    // a new search reads the local cache, which has to hold the pair in stock again
    await searchGlasses(page)
    await expect(result.getByRole('button', { name: 'Dispense' })).toBeVisible()
  })

  test('Undo dispension', async ({ page, createGlasses, api }) => {
    const { sku } = await createGlasses()
    await open(page, '/edit')
    await lookUpSku(page, sku)
    await page.getByRole('button', { name: 'Dispense' }).click()
    await expect(page.getByText(`Successfully dispensed glasses`)).toBeVisible()

    const recent = page.getByRole('region', { name: 'Recently dispensed or deleted' })
    const dispensed = recent.getByTestId('result-0')
    await expect(dispensed.getByRole('group', { name: `SKU ${formatSku(sku)}` })).toBeVisible()
    await dispensed.getByRole('button', { name: 'Undo' }).click()
    await expect(
      page.getByText(`Reverted dispension/deletion of SKU ${formatSku(sku)} successfully`),
    ).toBeVisible()
    expect((await api.get(`/api/glasses/sm/${sku}`)).ok()).toBe(true)
  })
})
