import { test, expect, logIn } from './fixtures'

// a login of its own, logging out ends the session on the server that the other tests share
test.use({ storageState: { cookies: [], origins: [] } })

test('Logout from the account menu', async ({ page }) => {
  await logIn(page)

  await page.getByRole('button', { name: 'Account' }).click()
  await expect(page.getByText('Logged in as test')).toBeVisible()
  await page.getByText('Logout').click()
  await expect(page.getByLabel('Username')).toBeVisible()
  await expect.poll(async () => (await page.request.get('/api/glasses/sa/all')).status()).toBe(401)
})
