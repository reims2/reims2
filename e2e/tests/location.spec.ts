import { test, expect } from '@playwright/test'

test('Switch location', async ({ page }) => {
  await page.goto('/find')

  await page.getByRole('button', { name: 'Change location (Santa Ana)' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'San Miguel' }).click()
  await dialog.getByRole('button', { name: 'Apply' }).click()
  await expect(dialog.getByText('Change location')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Change location (San Miguel)' })).toBeVisible()
})
