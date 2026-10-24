import { Page } from '@playwright/test'
import fs from 'fs'
import { test, expect } from './fixtures'

async function downloadCsv(page: Page, buttonIndex: number): Promise<string[]> {
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download' }).nth(buttonIndex).click()
  const csv = await fs.promises.readFile(await (await download).path(), 'utf8')
  return csv.trim().split('\n')
}

test('Download reports', async ({ page, api, createGlasses }) => {
  const { sku: inStock } = await createGlasses()
  const { sku: dispensed } = await createGlasses()
  expect((await api.put(`/api/glasses/dispense/sa/${dispensed}?reason=DISPENSED`)).ok()).toBe(true)
  const eye = { sphere: 25, cylinder: 0, axis: 0, add: 0 }
  const searchLog = await api.post('/api/glasses/sa/searchLog', {
    data: {
      glassesType: 'single',
      balLens: 'DISABLE_NONE',
      searchDate: Date.now(),
      increaseSearchTolerance: false,
      resultCount: 0,
      od: eye,
      os: eye,
    },
  })
  expect(searchLog.ok()).toBe(true)

  await page.goto('/manage/reports')

  const inventory = await downloadCsv(page, 0)
  expect(inventory.some((line) => line.startsWith(`"${inStock}","sa"`))).toBe(true)

  const dispense = await downloadCsv(page, 1)
  expect(dispense.some((line) => line.includes(`"true","${dispensed}"`))).toBe(true)

  const searches = await downloadCsv(page, 2)
  expect(searches.some((line) => line.includes('"25.00"'))).toBe(true)
})
