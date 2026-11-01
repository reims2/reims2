import { test, expect } from '@playwright/test'
import { EyeInput } from './eye-input.po'

test('Add glasses', async ({ page }) => {
  const eyeInput = new EyeInput(page)
  await page.goto('/add')

  await eyeInput.fill({
    category: 'm',
    appearance: 'm',
    size: 'm',
    od: { sphere: '0.7', cylinder: '0', add: '1' },
    os: { sphere: '1.0', cylinder: '0.2', axis: '010', add: '2' },
  })
  await page.getByRole('button', { name: 'dd glasses' }).click()

  const resultCard = page.getByTestId('result-0')
  await expect(resultCard).toBeVisible()

  await expect(resultCard.getByRole('row', { name: 'OD +0.75 +0.00 Add +1.00' })).toBeVisible()
  await expect(
    resultCard.getByRole('row', { name: 'OS +1.00 -0.25 × 010 Add +2.00' }),
  ).toBeVisible()
})
