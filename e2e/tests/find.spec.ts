import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL as string

test('test', async ({ page }) => {
  await page.goto(BASE_URL + '/find')
  await page.getByLabel('Category').fill('m')
  await page.getByLabel('Category').press('Enter')

  await page.getByLabel('Sphere').first().fill('0.2')
  await page.getByLabel('Sphere').first().press('Enter')
  await expect(page.getByLabel('Sphere').first()).toHaveValue('0.25')

  await page.getByLabel('Cylinder').first().fill('0')

  await page.getByLabel('Additional').first().fill('3')
  await page.getByLabel('Additional').first().press('Enter')
  await expect(page.getByLabel('Additional').first()).toHaveValue('3.00')
  await expect(page.getByLabel('Additional').nth(1)).toHaveValue('3.00')

  await page.getByLabel('Sphere').nth(1).fill('2.0')

  await page.getByLabel('Cylinder').nth(1).fill('0.5')

  await page.getByLabel('Axis').nth(1).fill('090')

  await page.getByRole('button', { name: 'S earch glasses' }).click()

  await expect(page.getByRole('main')).toContainText('SKU 0005')
})
