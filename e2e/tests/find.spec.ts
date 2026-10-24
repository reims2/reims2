import { EyeInput } from './eye-input.po'
import { test, expect, formatSku } from './fixtures'

test('Search multifocal', { tag: '@fast' }, async ({ page, createGlasses }) => {
  const { sku } = await createGlasses({
    glassesType: 'multifocal',
    od: { sphere: 4.25, cylinder: 0, axis: 0, add: 2.5 },
    os: { sphere: 4.5, cylinder: -1, axis: 150, add: 2.5 },
  })
  const eyeInput = new EyeInput(page)

  const glassesLoaded = page.waitForResponse((r) => r.url().endsWith('/all') && r.ok())
  await page.goto('/find')
  await glassesLoaded
  await eyeInput.waitForAutofocus()

  await eyeInput.category.fill('m')

  await eyeInput.odSphere.fill('4.2')
  await eyeInput.odSphere.press('Enter')
  await expect(eyeInput.odSphere).toHaveValue('4.25')

  await eyeInput.odCylinder.fill('0')

  await eyeInput.odAdditional.fill('2.5')
  await eyeInput.odAdditional.press('Enter')
  await expect(eyeInput.odAdditional).toHaveValue('2.50')
  await expect(eyeInput.osAdditional).toHaveValue('2.50')

  await eyeInput.osSphere.fill('4.5')
  await eyeInput.osCylinder.fill('1')
  await eyeInput.osAxis.fill('150')

  await page.getByRole('button', { name: 'earch glasses' }).click()

  const result = page.getByLabel('Results').getByLabel(`SKU ${formatSku(sku)}`)
  await expect(result).toBeVisible()
  await expect(result).toMatchAriaSnapshot(`
    - group:
      - text: /multifocal neutral medium OD/
      - table:
        - row "SPH +4.25 D"
        - row "CYL +0.00 D"
        - row "Axis 000"
        - row "Add +2.50 D"
      - text: /OS/
      - table:
        - row "SPH +4.50 D"
        - row "CYL -1.00 D"
        - row "Axis 150"
        - row "Add +2.50 D"
      - link "Open Glasses"
  `)
})
