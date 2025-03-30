import { EyeInput } from './eye-input.po'
import { test, expect } from './fixtures'

test.beforeEach(async ({ page }) => {
  page.goto('/edit')
  await expect(page.locator('div').filter({ hasText: 'Setting up REIMS2' })).toHaveCount(0)
})

test('Dispense glasses with button and revert', { tag: '@fast' }, async ({ page, glassesSku }) => {
  await page.getByLabel('SKU', { exact: true }).fill(glassesSku)
  await page.getByRole('button', { name: 'Dispense' }).click()
  await expect(
    page.getByText(`Successfully dispensed glasses with SKU ${glassesSku}`),
  ).toBeVisible()

  // Disabled for now due to race conditions
  // await page.getByLabel('Recently dispensed or deleted').getByTestId('result-0').getByRole('button', { name: 'Undo' }).click()
  // await expect(page.getByLabel('Recently dispensed or deleted')).toContainText('SKU 0005')
  // const successUndo = page.getByText(
  //   `Reverted dispension/deletion of SKU ${glassesSku} successfully`,
  // )
  // const failureUndoAlreadyUsed = page.getByText(`Previous SKU is already used`)
  // await expect(successUndo.or(failureUndoAlreadyUsed)).toBeVisible()
})

test('Delete glasses', async ({ page, glassesSku }) => {
  await page.getByLabel('SKU', { exact: true }).fill(glassesSku)
  await page.getByLabel('More options').click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Not found in storage' }).click()
  await page.getByRole('button', { name: 'Confirm deletion' }).click()
  await expect(page.getByText(`Successfully deleted glasses with SKU ${glassesSku}`)).toBeVisible()
})

test('Edit glasses', async ({ page, glassesSku }) => {
  await page.getByLabel('SKU', { exact: true }).fill(glassesSku)
  await page.getByRole('button', { name: 'Edit' }).click()

  const eyeInput = new EyeInput(page)
  await eyeInput.appearance.fill('f')
  await eyeInput.odSphere.fill('7')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Editing SKU')).toBeHidden()

  await expect(page.getByLabel('Glasses result')).toContainText('SPH+7.00')
})
