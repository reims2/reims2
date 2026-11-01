import { test, expect, formatSku } from './fixtures'

test('Filter table and open glasses for editing', async ({ page, createGlasses }) => {
  const eye = { sphere: 9.75, cylinder: -0.25, axis: 45, add: 0 }
  const sku = formatSku((await createGlasses({ od: eye, os: eye })).sku)
  await page.goto('/view')

  await page.getByText('OD SPH', { exact: true }).click()

  const odSphere = page.getByRole('group', { name: 'OD SPH' })
  await odSphere.getByRole('spinbutton', { name: 'From', exact: true }).fill('9.75')
  await odSphere.getByRole('spinbutton', { name: 'To', exact: true }).fill('9.75')
  const row = page.getByRole('row').filter({ hasText: sku })
  await expect(row).toBeVisible()
  await expect(row).toContainText('+9.75')

  await row.getByRole('link').click()
  await expect(page).toHaveURL(new RegExp(`/edit\\?sku=${Number(sku)}$`))
  await expect(
    page.getByLabel('Glasses result').getByRole('group', { name: `SKU ${sku}` }),
  ).toBeVisible()
})
