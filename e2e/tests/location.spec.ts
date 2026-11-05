import { test, expect } from './fixtures'

test('Switch location', async ({ page }) => {
  await page.goto('/find')

  await page.getByRole('button', { name: 'Change location, currently Santa Ana' }).click()
  await page.getByText('San Miguel').click()
  await expect(page.getByText('Now using San Miguel')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Change location, currently San Miguel' }),
  ).toBeEnabled()
})
