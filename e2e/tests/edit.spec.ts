import { EyeInput } from './eye-input.po'
import { test, expect, formatSku, lookUpSku, open } from './fixtures'

test.beforeEach(async ({ page }) => {
  await open(page, '/edit')
})

test('Typing on to an unknown SKU clears the result', async ({ page, createGlasses }) => {
  await lookUpSku(page, (await createGlasses()).sku)
  await page.getByLabel('SKU', { exact: true }).fill('99999')
  await expect(page.getByLabel('Glasses result')).toHaveCount(0)
  await page.getByRole('button', { name: 'Dispense' }).click()
  await expect(page.getByText('SKU not found')).toBeVisible()
})

test('Dispense and undo', async ({ page, createGlasses, api }) => {
  const { sku } = await createGlasses()
  await lookUpSku(page, sku)
  await page.getByRole('button', { name: 'Dispense' }).click()
  await expect(
    page.getByText(`Successfully dispensed glasses with SKU ${formatSku(sku)}`),
  ).toBeVisible()

  // other tests dispense on this site too, so find the pair by its SKU, not as the newest
  await page
    .getByRole('region', { name: 'Recently dispensed or deleted' })
    .getByRole('group', { name: `SKU ${formatSku(sku)}` })
    .getByRole('button', { name: 'Undo' })
    .click()
  await expect(
    page.getByText(`Reverted dispension/deletion of SKU ${formatSku(sku)} successfully`),
  ).toBeVisible()
  await expect(await api.get(`/api/glasses/sa/${sku}`)).toBeOK()
})

test('Delete glasses', async ({ page, createGlasses }) => {
  const { sku } = await createGlasses()
  await lookUpSku(page, sku)
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Not found in storage' }).click()
  await page.getByRole('button', { name: 'Confirm deletion' }).click()
  await expect(
    page.getByText(`Successfully deleted glasses with SKU ${formatSku(sku)}`),
  ).toBeVisible()
})

test('Edit glasses', async ({ page, createGlasses }) => {
  await lookUpSku(page, (await createGlasses()).sku)
  await page.getByRole('button', { name: 'Edit' }).click()

  const eyeInput = new EyeInput(page)
  await eyeInput.waitForAutofocus()
  await eyeInput.appearance.fill('f')
  await eyeInput.od.sphere.fill('7')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Editing SKU')).toBeHidden()

  await expect(
    page.getByLabel('Glasses result').getByRole('row', { name: /^OD \+7\.00/ }),
  ).toBeVisible()
})

test('Editing glasses another device dispensed', async ({ page, createGlasses, api }) => {
  const glasses = await createGlasses()
  await lookUpSku(page, glasses.sku)
  await page.getByRole('button', { name: 'Edit' }).click()
  await new EyeInput(page).waitForAutofocus()
  await api.put(`/api/glasses/${glasses.id}/dispense`)
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('These glasses were dispensed in the meantime.')).toBeVisible()
  await expect(page.getByText('Editing SKU')).toBeHidden()
  await expect(page.getByLabel('Glasses result')).toHaveCount(0)
})
