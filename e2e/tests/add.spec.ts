import { EyeInput } from './eye-input.po'
import { test, expect } from './fixtures'

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

test('A adds glasses but Ctrl+A only selects the field', async ({ page }) => {
  const eyeInput = new EyeInput(page)
  let adds = 0
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().endsWith('/api/glasses')) adds++
  })
  await page.goto('/add')

  await eyeInput.fill({
    category: 's',
    appearance: 'n',
    size: 's',
    od: { sphere: '6.5', cylinder: '0' },
    os: { sphere: '6.5', cylinder: '0' },
  })

  await eyeInput.os.sphere.press('ControlOrMeta+a')
  await eyeInput.os.sphere.pressSequentially('6.75')
  await expect(eyeInput.os.sphere).toHaveValue('6.75')
  expect(adds).toBe(0)

  await eyeInput.os.sphere.press('a')

  await expect(
    page.getByTestId('result-0').getByRole('row', { name: 'OS +6.75 +0.00' }),
  ).toBeVisible()
  expect(adds).toBe(1)
})
