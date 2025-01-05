import { test, expect } from '@playwright/test'
import fs from 'fs'

test('Download reports', async ({ page }) => {
  await page.goto('/manage/reports')

  const inventoryDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download' }).first().click()
  const inventoryCsv = await inventoryDownloadPromise
  // TODO increase size in future, this is for an empty DB
  expect((await fs.promises.stat((await inventoryCsv.path()) as string)).size).toBeGreaterThan(200)

  // await page.getByRole('combobox').click()
  // TODO await page.getByRole('option', { name: '2024' }).click()
  const dispenseDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download' }).nth(1).click()
  const dispenseCsv = await dispenseDownloadPromise
  expect((await fs.promises.stat((await dispenseCsv.path()) as string)).size).toBeGreaterThan(200)
})
