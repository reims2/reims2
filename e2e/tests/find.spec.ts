import { EyeInput } from './eye-input.po'
import { test, expect, formatSku } from './fixtures'

test('Search multifocal', async ({ page, createGlasses }) => {
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

  const result = page.getByLabel('Results').getByRole('group', { name: `SKU ${formatSku(sku)}` })
  await expect(result).toBeVisible()
  await expect(result).toMatchAriaSnapshot(`
    - group:
      - text: /multifocal.*medium.*neutral/
      - table:
        - row "OD +4.25 +0.00 Add +2.50"
        - row "OS +4.50 -1.00 × 150 Add +2.50"
      - link "Open"
      - button "Dispense"
  `)
})

test('Dispense from results', async ({ page, createGlasses }) => {
  const { sku } = await createGlasses({
    od: { sphere: -6.5, cylinder: 0, axis: 0, add: 0 },
    os: { sphere: -6.75, cylinder: 0, axis: 0, add: 0 },
  })
  const glassesLoaded = page.waitForResponse((r) => r.url().endsWith('/all') && r.ok())
  await page.goto('/find')
  await glassesLoaded
  await new EyeInput(page).fill({
    category: 's',
    od: { sphere: '-6.5', cylinder: '0' },
    os: { sphere: '-6.75', cylinder: '0' },
  })
  await page.getByRole('button', { name: 'earch glasses' }).click()

  const result = page.getByLabel('Results').getByRole('group', { name: `SKU ${formatSku(sku)}` })
  await result.getByRole('button', { name: 'Dispense' }).click()
  await expect(
    page.getByText(`Successfully dispensed glasses with SKU ${formatSku(sku)}`),
  ).toBeVisible()
  await expect(result.getByText('Dispensed')).toBeVisible()
  await expect(result.getByRole('button', { name: 'Undo' })).toBeVisible()
})

test('S searches from a field that still needs formatting', async ({ page, createGlasses }) => {
  const eye = { sphere: 5.25, cylinder: 0, axis: 0, add: 0 }
  const { sku } = await createGlasses({ od: eye, os: eye })
  const eyeInput = new EyeInput(page)

  const glassesLoaded = page.waitForResponse((r) => r.url().endsWith('/all') && r.ok())
  await page.goto('/find')
  await glassesLoaded
  await eyeInput.waitForAutofocus()

  await eyeInput.category.fill('s')
  await eyeInput.odSphere.fill('5.2')
  await eyeInput.osSphere.fill('5.2')
  await eyeInput.osSphere.press('s')

  await expect(eyeInput.osSphere).toHaveValue('5.25')
  await expect(
    page.getByLabel('Results').getByRole('group', { name: `SKU ${formatSku(sku)}` }),
  ).toBeVisible()
})

test('S shows the missing fields like the search button', async ({ page }) => {
  const eyeInput = new EyeInput(page)
  await page.goto('/find')
  await eyeInput.waitForAutofocus()

  await eyeInput.odSphere.press('s')

  await expect(eyeInput.osInput.getByText('Required', { exact: true })).toBeVisible()
})

test('Holding S searches once and leaves Category alone', async ({ page, createGlasses }) => {
  const eye = { sphere: 5.5, cylinder: 0, axis: 0, add: 0 }
  const { sku } = await createGlasses({ od: eye, os: eye })
  const eyeInput = new EyeInput(page)

  const glassesLoaded = page.waitForResponse((r) => r.url().endsWith('/all') && r.ok())
  await page.goto('/find')
  await glassesLoaded
  await eyeInput.waitForAutofocus()

  await eyeInput.category.fill('single')
  await eyeInput.odSphere.fill('5.50')
  await eyeInput.osSphere.fill('5.50')
  await page.keyboard.down('s')
  await expect(eyeInput.category).toBeFocused()
  await page.keyboard.down('s')
  await page.keyboard.up('s')

  await expect(eyeInput.category).toHaveValue('single')
  await expect(
    page.getByLabel('Results').getByRole('group', { name: `SKU ${formatSku(sku)}` }),
  ).toBeVisible()
})
