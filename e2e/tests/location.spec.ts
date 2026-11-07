import { EyeInput } from './eye-input.po'
import { test, expect, open, searchGlasses, searchResult } from './fixtures'

test('Switch location', async ({ page, createGlasses }) => {
  const rx = { od: { sphere: 11.75 }, os: { sphere: 11.75 } }
  const santaAna = await createGlasses(rx)
  const sanMiguel = await createGlasses({ ...rx, location: 'sm' })
  await open(page, '/find')
  await new EyeInput(page).fill({
    category: 's',
    od: { sphere: '11.75', cylinder: '0' },
    os: { sphere: '11.75', cylinder: '0' },
  })
  await searchGlasses(page)
  await expect(searchResult(page, santaAna.sku)).toBeVisible()

  await page.getByRole('button', { name: 'Change location, currently Santa Ana' }).click()
  await page.getByText('San Miguel').click()
  await expect(page.getByText('Now using San Miguel')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Change location, currently San Miguel' }),
  ).toBeEnabled()

  // Find searches the cached glasses, so the switch has to replace them
  await searchGlasses(page)
  await expect(searchResult(page, sanMiguel.sku)).toBeVisible()
  await expect(searchResult(page, santaAna.sku)).toHaveCount(0)
})
