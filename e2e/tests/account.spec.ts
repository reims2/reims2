import { test, expect } from '@playwright/test'

test('Logout from the account menu', async ({ page }) => {
  await page.goto('/find')

  await page.getByRole('button', { name: 'Account' }).click()
  await expect(page.getByText('Logged in as test')).toBeVisible()
  await page.getByText('Logout').click()
  await expect(page.getByLabel('Username')).toBeVisible()
})
