import { test, expect } from '@playwright/test'
import fs from 'fs'

test('Download reports', async ({ page }) => {
  await page.goto('/manage/reports')

  const inventoryDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download' }).first().click()
  const inventoryCsv = await inventoryDownloadPromise
  // header plus at least one of the seeded glasses
  const inventory = await fs.promises.readFile(await inventoryCsv.path(), 'utf8')
  expect(inventory.trim().split('\n').length).toBeGreaterThan(1)

  // await page.getByRole('combobox').click()
  const dispenseDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download' }).nth(1).click()
  const dispenseCsv = await dispenseDownloadPromise
  expect((await fs.promises.stat(await dispenseCsv.path())).size).toBeGreaterThan(200)
})
