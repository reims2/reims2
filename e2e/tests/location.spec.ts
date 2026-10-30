import { test, expect } from '@playwright/test'

test('Switch location', async ({ page }) => {
  await page.goto('/find')

  await page.getByRole('button', { name: 'Change location (Santa Ana)' }).click()
  await page.getByText('San Miguel').click()
  await expect(page.getByText('Now using San Miguel')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Change location (San Miguel)' })).toBeEnabled()
})
