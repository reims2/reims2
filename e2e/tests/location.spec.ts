import { test, expect } from '@playwright/test'

test('Switch location', { tag: '@fast' }, async ({ page }) => {
  await page.goto('/find')

  await page.getByText('Change location').click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'San Miguel' }).click()
  await dialog.getByRole('button', { name: 'Apply' }).click()
  await expect(dialog.getByText('Change location')).toBeHidden()
  await expect(page.getByRole('navigation')).toContainText('REIMS San Miguel')
})
