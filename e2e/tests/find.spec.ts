import { test, expect } from '@playwright/test'
import { EyeInput } from './eye-input.po'

test('Search multifocal', { tag: '@fast' }, async ({ page }) => {
  const eyeInput = new EyeInput(page)

  await page.goto('/find')

  await eyeInput.category.fill('m')

  await eyeInput.odSphere.fill('0.2')
  await eyeInput.odSphere.press('Enter')
  await expect(eyeInput.odSphere).toHaveValue('0.25')

  await eyeInput.odCylinder.fill('0')

  await eyeInput.odAdditional.fill('3')
  await eyeInput.odAdditional.press('Enter')
  await expect(eyeInput.odAdditional).toHaveValue('3.00')
  await expect(eyeInput.osAdditional).toHaveValue('3.00')

  await eyeInput.osSphere.fill('2.0')

  await eyeInput.osCylinder.fill('0.5')

  await eyeInput.osAxis.fill('090')

  await page.getByRole('button', { name: 'earch glasses' }).click()

  await expect(page.getByTestId('results')).toContainText('SKU 0005')
})
