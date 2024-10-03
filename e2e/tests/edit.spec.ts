import { test, expect } from '@playwright/test'

test.skip('Edit page', async ({ page }) => {
  await page.goto('/edit')

  await expect(page.locator('div').filter({ hasText: 'Setting up REIMS2' })).toHaveCount(0)

  await page.getByLabel('SKU').fill('3')
  await page.getByLabel('SKU').press('Enter')
  await expect(page.getByText('Successfully dispensed glasses with SKU 3')).toBeVisible()

  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByText('Reverted dispension/deletion of SKU 3 successfully')).toBeVisible()

  await page.getByLabel('SKU').fill('3')
  await page.getByRole('button', { name: 'Dispense' }).click()
  await expect(page.getByText('Successfully dispensed glasses with SKU 3')).toBeVisible()

  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByText('Reverted dispension/deletion of SKU 3 successfully')).toBeVisible()
})
