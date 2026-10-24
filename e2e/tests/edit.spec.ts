import { EyeInput } from './eye-input.po'
import { test, expect, formatSku } from './fixtures'

test.beforeEach(async ({ page }) => {
  await page.goto('/edit')
  await expect(page.getByText('Setting up REIMS2')).toHaveCount(0)
})

test('Dispense glasses with button', { tag: '@fast' }, async ({ page, createGlasses }) => {
  const sku = formatSku((await createGlasses()).sku)
  await page.getByLabel('SKU', { exact: true }).fill(sku)
  await page.getByRole('button', { name: 'Dispense' }).click()
  await expect(page.getByText(`Successfully dispensed glasses with SKU ${sku}`)).toBeVisible()
})

test.describe('Undo', () => {
  // a freed SKU goes to the next added pair, so this needs a site no other test adds to
  test.use({ location: 'sm' })

  test('Undo dispension', async ({ page, createGlasses, api }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'other browsers would add to sm concurrently')
    const { sku } = await createGlasses()
    await page.getByLabel('SKU', { exact: true }).fill(formatSku(sku))
    await page.getByRole('button', { name: 'Dispense' }).click()
    await expect(page.getByText(`Successfully dispensed glasses`)).toBeVisible()

    const recent = page.getByRole('region', { name: 'Recently dispensed or deleted' })
    const dispensed = recent.getByTestId('result-0')
    await expect(dispensed).toContainText(`SKU ${formatSku(sku)}`)
    await dispensed.getByRole('button', { name: 'Undo' }).click()
    await expect(
      page.getByText(`Reverted dispension/deletion of SKU ${formatSku(sku)} successfully`),
    ).toBeVisible()
    expect((await api.get(`/api/glasses/sm/${sku}`)).ok()).toBe(true)
  })
})

test('Delete glasses', async ({ page, createGlasses }) => {
  const sku = formatSku((await createGlasses()).sku)
  await page.getByLabel('SKU', { exact: true }).fill(sku)
  await page.getByLabel('More options').click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Not found in storage' }).click()
  await page.getByRole('button', { name: 'Confirm deletion' }).click()
  await expect(page.getByText(`Successfully deleted glasses with SKU ${sku}`)).toBeVisible()
})

test('Edit glasses', async ({ page, createGlasses }) => {
  const sku = formatSku((await createGlasses()).sku)
  await page.getByLabel('SKU', { exact: true }).fill(sku)
  await page.getByRole('button', { name: 'Edit' }).click()

  const eyeInput = new EyeInput(page)
  await eyeInput.waitForAutofocus()
  await eyeInput.appearance.fill('f')
  await eyeInput.odSphere.fill('7')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Editing SKU')).toBeHidden()

  await expect(page.getByLabel('Glasses result')).toContainText('SPH+7.00')
})
