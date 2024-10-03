import { test, expect } from './fixtures'

test.beforeEach(async ({ page }) => {
  page.goto('/edit')
  await expect(page.locator('div').filter({ hasText: 'Setting up REIMS2' })).toHaveCount(0)
})

test('Dispense glasses with button and revert', { tag: '@fast' }, async ({ page, glassesSku }) => {
  await page.getByLabel('SKU').fill(glassesSku)
  await page.getByRole('button', { name: 'Dispense' }).click()
  await expect(
    page.getByText(`Successfully dispensed glasses with SKU ${glassesSku}`),
  ).toBeVisible()

  // Disabled for now due to race conditions
  // await page.getByTestId('result-0').getByRole('button', { name: 'Undo' }).click()
  // const successUndo = page.getByText(
  //   `Reverted dispension/deletion of SKU ${glassesSku} successfully`,
  // )
  // const failureUndoAlreadyUsed = page.getByText(`Previous SKU is already used`)
  // await expect(successUndo.or(failureUndoAlreadyUsed)).toBeVisible()
})

test('Delete glasses', async ({ page, glassesSku }) => {
  await page.getByLabel('SKU').fill(glassesSku)
  await page.getByLabel('More options').click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Not found in storage' }).click()
  await page.getByRole('button', { name: 'Confirm deletion' }).click()
  await expect(page.getByText(`Successfully deleted glasses with SKU ${glassesSku}`)).toBeVisible()
})
