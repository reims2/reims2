import { BrowserContext, Page } from '@playwright/test'
import { EyeInput } from './eye-input.po'
import { test, expect, formatSku, lookUpSku, open, searchGlasses, searchResult } from './fixtures'

async function reloadOffline(page: Page, context: BrowserContext) {
  await open(page, '/find')
  // the app shell is only cached once the service worker controls the page
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText('You are offline')).toBeVisible()
}

test('Search works offline', async ({ page, context, createGlasses }) => {
  const { sku } = await createGlasses({ od: { sphere: -7.25 }, os: { sphere: -7.25 } })
  await reloadOffline(page, context)

  await new EyeInput(page).fill({
    category: 's',
    od: { sphere: '-7.25', cylinder: '0' },
    os: { sphere: '-7.25', cylinder: '0' },
  })
  await searchGlasses(page)
  await expect(searchResult(page, sku)).toBeVisible()
})

test('Inventory works offline', async ({ page, context, createGlasses }) => {
  const { sku } = await createGlasses({ od: { sphere: -7.5 }, os: { sphere: -7.5 } })
  await reloadOffline(page, context)

  await page.getByRole('link', { name: 'Inventory' }).click()
  await expect(page.getByRole('row').filter({ hasText: formatSku(sku) })).toBeVisible()
})

test('Dispense offline uploads once back online', async ({ page, context, createGlasses, api }) => {
  const { id, sku } = await createGlasses()
  await open(page, '/edit')
  await lookUpSku(page, sku)

  await context.setOffline(true)
  await page.getByRole('button', { name: 'Dispense' }).click()
  await expect(
    page.getByText(`Glasses with SKU ${formatSku(sku)} will be dispensed when you're back online`),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sync status: 1 waiting' })).toBeVisible()
  await page.getByLabel('SKU', { exact: true }).fill(formatSku(sku))
  await expect(page.getByLabel('Glasses result')).toBeHidden()

  await context.setOffline(false)
  await expect(page.getByRole('button', { name: /Sync status: \d+ waiting/ })).toBeHidden({
    timeout: 15000,
  })
  // the freed SKU may already belong to another test's new pair
  const current = await api.get(`/api/glasses/sa/${sku}`)
  expect(current.ok() && (await current.json()).id === id).toBe(false)
})
