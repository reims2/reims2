import { test, expect } from '@playwright/test'

const authFile = '.auth/user.json'

test('Login', { tag: '@fast' }, async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Open REIMS2' }).click()
  await page.getByLabel('Username').fill('test')
  await page.getByLabel('Password').fill('testtest')
  await page.getByLabel('Password').press('Enter')
  await page.waitForURL('**/find')

  await page.waitForResponse(
    (response) => response.url().includes('/all') && response.status() === 200,
  )
  await expect(page.locator('div').filter({ hasText: 'Setting up REIMS2' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'REIMS Santa Ana' })).toBeInViewport()
  await page.context().storageState({ path: authFile })
})
