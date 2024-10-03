import { test, expect } from '@playwright/test'
import { EyeInput } from './eye-input.po'

test('Add page', async ({ page }) => {
  const eyeInput = new EyeInput(page)
  await page.goto('/add')

  await eyeInput.category.fill('m')
  await eyeInput.appearance.fill('m')
  await eyeInput.size.fill('m')

  await eyeInput.odSphere.fill('0.7')
  await eyeInput.odCylinder.fill('0')
  await eyeInput.odAdditional.fill('1')

  await eyeInput.osSphere.fill('1.0')
  await eyeInput.osCylinder.fill('0.2')
  await eyeInput.osAxis.fill('010')
  await eyeInput.osAdditional.fill('2')

  await page.getByRole('button', { name: 'dd glasses' }).click()

  await expect(page.getByTestId('OD-card')).toContainText('SPH+0.75 D')
  await expect(page.getByTestId('OD-card')).toContainText('CYL+0.00 D')
  await expect(page.getByTestId('OD-card')).toContainText('Axis000')
  await expect(page.getByTestId('OD-card')).toContainText('Add+1.00 D')

  await expect(page.getByTestId('OS-card')).toContainText('SPH+1.00 D')
  await expect(page.getByTestId('OS-card')).toContainText('CYL-0.25 D')
  await expect(page.getByTestId('OS-card')).toContainText('Axis010')
  await expect(page.getByTestId('OS-card')).toContainText('Add+2.00 D')
})
