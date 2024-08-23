import { test, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'
const PASSWORD = process.env.REIMS_PASSWORD as string

test('test', async ({ page }) => {
  await page.goto('https://reims2.app/')
  await page.getByRole('link', { name: 'Open REIMS2' }).click()
  await page.getByLabel('Username').fill('reims')
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByLabel('Password').press('Enter')
  await page.waitForURL('**/find')
  await expect(page.getByRole('link', { name: 'REIMS Santa Ana' })).toBeInViewport()

  //   await expect(page.locator('div').filter({ hasText: 'Setting up REIMS2' }).nth(2)).toBeVisible()
  await page.context().storageState({ path: authFile })
})
