import { test, expect, logIn } from './fixtures'
import { authFile } from '../playwright.config'

test('Login', async ({ page }) => {
  await logIn(page)

  await expect(page.getByText('Setting up REIMS2')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Change location, currently Santa Ana' }),
  ).toBeInViewport()
  await page.context().storageState({ path: authFile })
})
