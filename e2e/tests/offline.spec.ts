import { EyeInput } from './eye-input.po'
import { test, expect, formatSku } from './fixtures'

test('Search works offline', async ({ page, context, createGlasses }) => {
  const eye = { sphere: -7.25, cylinder: 0, axis: 0, add: 0 }
  const sku = formatSku((await createGlasses({ od: eye, os: eye })).sku)

  const glassesLoaded = page.waitForResponse((r) => r.url().endsWith('/all') && r.ok())
  await page.goto('/find')
  await glassesLoaded
  // the app shell is only cached once the service worker controls the page
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText('REIMS is running offline.')).toBeVisible()

  const eyeInput = new EyeInput(page)
  await eyeInput.fill({
    category: 's',
    od: { sphere: '-7.25', cylinder: '0' },
    os: { sphere: '-7.25', cylinder: '0' },
  })
  await page.getByRole('button', { name: 'earch glasses' }).click()
  await expect(page.getByLabel('Results').getByLabel(`SKU ${sku}`)).toBeVisible()
})

test('Dispense offline uploads once back online', async ({ page, context, createGlasses, api }) => {
  const { sku } = await createGlasses()
  await page.goto('/edit')
  await expect(page.getByText('Setting up REIMS2')).toHaveCount(0)
  const skuInput = page.getByLabel('SKU', { exact: true })
  await skuInput.fill(formatSku(sku))
  await expect(page.getByLabel('Glasses result')).toBeVisible()

  await context.setOffline(true)
  await page.getByRole('button', { name: 'Dispense' }).click()
  await expect(
    page.getByText(`Glasses with SKU ${formatSku(sku)} will be dispensed when you're back online`),
  ).toBeVisible()
  await expect(page.getByText('1 waiting to upload')).toBeVisible()
  await skuInput.fill(formatSku(sku))
  await expect(page.getByLabel('Glasses result')).toBeHidden()

  await context.setOffline(false)
  await expect(page.getByText('waiting to upload')).toBeHidden({ timeout: 15000 })
  expect((await api.get(`/api/glasses/sa/${sku}`)).status()).toBe(404)
})
