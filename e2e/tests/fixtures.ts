import { test as base } from '@playwright/test'
import { EyeInput } from './eye-input.po'

export const test = base.extend<{ glassesSku: string }>({
  glassesSku: async ({ context }, use) => {
    const page = await context.newPage()
    const eyeInput = new EyeInput(page)

    await page.goto('/add')

    await eyeInput.category.fill('s')
    await eyeInput.appearance.fill('m')
    await eyeInput.size.fill('m')

    await eyeInput.odSphere.fill('0.7')
    await eyeInput.odCylinder.fill('0')

    await eyeInput.osSphere.fill('1.0')
    await eyeInput.osCylinder.fill('0')

    await page.getByRole('button', { name: 'dd glasses' }).click()
    const resultCard = await page.getByTestId('result-0', { timeout: 10000 })
    const sku = (await resultCard.getByText('SKU').textContent()).replace('SKU', '').trim()

    await use(sku)
  },
})
export { expect } from '@playwright/test'
