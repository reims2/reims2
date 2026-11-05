import { test, expect, glassesLoaded } from './fixtures'
import { authFile } from '../playwright.config'

test('Login', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Username').fill('test')
  await page.getByLabel('Password').fill('testtest')
  const loaded = glassesLoaded(page)
  await page.getByLabel('Password').press('Enter')
  await page.waitForURL('**/find')
  await loaded

  await expect(page.getByText('Setting up REIMS2')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Change location, currently Santa Ana' }),
  ).toBeInViewport()
  await page.context().storageState({ path: authFile })
})
