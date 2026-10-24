import { test, expect } from './fixtures'

test('Add and delete a user', async ({ page }, testInfo) => {
  // usernames are limited to 20 characters
  const username = `e2e-${testInfo.project.name.slice(0, 2)}-${Date.now() % 1e8}`
  await page.goto('/manage/users')

  await page.getByRole('button', { name: 'Add new user' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Username').fill(username)
  await dialog.getByLabel('Password').fill('e2e-password')
  await dialog.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'ROLE_USER' }).click()
  await page.keyboard.press('Escape')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()

  const row = page.getByRole('row').filter({ hasText: username })
  await expect(row).toContainText('ROLE_USER')
  await row.getByRole('button').last().click()
  await expect(row).toHaveCount(0)
})
