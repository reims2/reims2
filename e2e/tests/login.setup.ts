import { test, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'
const BASE_URL = process.env.BASE_URL as string

test('test', async ({ page }) => {
  await page.goto(BASE_URL)
  await page.getByRole('link', { name: 'Open REIMS2' }).click()
  await page.getByLabel('Username').fill('test')
  await page.getByLabel('Password').fill('testtest')
  await page.getByLabel('Password').press('Enter')
  await page.waitForURL('**/find')
  await expect(page.getByRole('link', { name: 'REIMS Santa Ana' })).toBeInViewport()

  //   await expect(page.locator('div').filter({ hasText: 'Setting up REIMS2' }).nth(2)).toBeVisible()
  await page.context().storageState({ path: authFile })
})
