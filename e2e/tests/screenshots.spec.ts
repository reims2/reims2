import path from 'node:path'
import { Locator, Page } from '@playwright/test'
import { EyeInput } from './eye-input.po'
import { test, expect, formatSku } from './fixtures'

// images for the user guide, run with `pnpm screenshots` and commit the ones that changed
const outDir = path.join(__dirname, '../../docs/src/public/screenshots')

test.use({ viewport: { width: 1280, height: 880 } })

async function open(page: Page, url: string) {
  await page.goto(url)
  await expect(page.getByText('Setting up REIMS2')).toHaveCount(0)
}

// marks a control that is easy to miss, only where the guide needs it
async function highlight(locator: Locator) {
  await locator.evaluate((el) => {
    el.style.outline = '4px solid #d50000'
    el.style.outlineOffset = '4px'
  })
}

// name ends in .png, or .jpg for photos
async function shoot(page: Page, name: string, blur = true) {
  if (blur) await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.mouse.move(0, 0)
  await page.screenshot({
    path: path.join(outDir, name),
    animations: 'disabled',
    quality: name.endsWith('.jpg') ? 80 : undefined,
  })
}

test('find', async ({ page, createGlasses }) => {
  for (const sphere of [-7.25, -7.5, -7]) {
    await createGlasses({
      od: { sphere, cylinder: -0.75, axis: 90, add: 0 },
      os: { sphere: -7.25, cylinder: -0.5, axis: 85, add: 0 },
    })
  }
  await open(page, '/find')
  await new EyeInput(page).fill({
    category: 's',
    od: { sphere: '-7.25', cylinder: '-0.75', axis: '090' },
    os: { sphere: '-7.25', cylinder: '-0.5', axis: '085' },
  })
  await page.getByRole('button', { name: 'earch glasses' }).click()
  await expect(page.getByText(/^3 matches/)).toBeVisible()
  await shoot(page, 'find.png')
})

test('dispense', async ({ page, createGlasses }) => {
  const { sku } = await createGlasses()
  await open(page, '/edit')
  await page.getByLabel('SKU', { exact: true }).fill(formatSku(sku))
  await expect(page.getByLabel('Glasses result')).toBeVisible()
  await shoot(page, 'dispense.png')
})

test('edit and delete dialogs', async ({ page, createGlasses }) => {
  const { sku } = await createGlasses()
  await open(page, '/edit')
  await page.getByLabel('SKU', { exact: true }).fill(formatSku(sku))
  await page.getByRole('button', { name: 'Edit' }).click()
  await new EyeInput(page).waitForAutofocus()
  await shoot(page, 'edit-dialog.png')
  await page.getByRole('button', { name: 'Cancel' }).click()

  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Not found in storage' }).click()
  await expect(page.getByRole('button', { name: 'Confirm deletion' })).toBeVisible()
  await shoot(page, 'delete-dialog.png')
})

test('add', async ({ page }) => {
  await open(page, '/add')
  const eyeInput = new EyeInput(page)
  await eyeInput.fill({
    category: 'm',
    appearance: 'n',
    size: 'm',
    od: { sphere: '1.5', cylinder: '-0.5', axis: '170', add: '2' },
    os: { sphere: '1.75', cylinder: '0' },
  })
  await expect(eyeInput.osAdditional).toHaveValue('2.00')
  await shoot(page, 'add.png')
})

test('location', async ({ page }) => {
  await open(page, '/manage/reports')
  const location = page.getByRole('button', { name: /^Change location/ })
  await location.click()
  await expect(page.getByText('San Miguel')).toBeVisible()
  await highlight(location)
  await shoot(page, 'location.png', false)
})

test('offline', async ({ page, context }) => {
  await open(page, '/find')
  await context.setOffline(true)
  await expect(page.getByText('You are offline')).toBeVisible()
  await highlight(page.getByRole('button', { name: /^Sync status/ }))
  await shoot(page, 'offline.png', false)
  await context.setOffline(false)
})

test('inventory', async ({ page }) => {
  await open(page, '/view')
  await expect(page.getByRole('row').nth(5)).toBeVisible()
  await shoot(page, 'inventory.png')
})

test.describe('signed out', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('start', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await shoot(page, 'start.jpg')
  })
})
