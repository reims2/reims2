import { test, expect } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('https://reims2.app/find')
  await page.getByLabel('Category').fill('m')
  await page.getByLabel('Category').press('Enter')

  await page.getByLabel('Sphere').first().fill('1.2')
  await page.getByLabel('Sphere').first().press('Enter')
  await expect(page.getByLabel('Sphere').first()).toHaveValue('1.25')

  await page.getByLabel('Cylinder').first().fill('1.7')

  await page.getByLabel('Axis').first().fill('001')

  await page.getByLabel('Additional').first().fill('1')
  await page.getByLabel('Additional').first().press('Enter')
  await expect(page.getByLabel('Additional').first()).toHaveValue('1.00')
  await expect(page.getByLabel('Additional').nth(1)).toHaveValue('1.00')

  await page.locator('#input-30').fill('2.0')

  await page.locator('#input-32').fill('1.5')

  await page.locator('#input-34').fill('002')

  await page.locator('#input-36').press('Enter')

  await expect(page.getByRole('main')).toContainText('SKU 0926')
})
