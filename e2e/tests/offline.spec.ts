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
