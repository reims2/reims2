import { EyeInput } from './eye-input.po'
import { test, expect, open, searchGlasses, searchResult } from './fixtures'

test('Search multifocal', async ({ page, createGlasses }) => {
  const { sku } = await createGlasses({
    glassesType: 'multifocal',
    od: { sphere: 4.25, add: 2.5 },
    os: { sphere: 4.5, cylinder: -1, axis: 150, add: 2.5 },
  })
  const eyeInput = new EyeInput(page)
  await open(page, '/find')
  await eyeInput.waitForAutofocus()

  await eyeInput.category.fill('m')

  await eyeInput.od.sphere.fill('4.2')
  await eyeInput.od.sphere.press('Enter')
  await expect(eyeInput.od.sphere).toHaveValue('4.25')

  await eyeInput.od.cylinder.fill('0')

  await eyeInput.od.add.fill('2.5')
  await eyeInput.od.add.press('Enter')
  await expect(eyeInput.od.add).toHaveValue('2.50')
  await expect(eyeInput.os.add).toHaveValue('2.50')

  await eyeInput.os.sphere.fill('4.5')
  await eyeInput.os.cylinder.fill('1')
  await eyeInput.os.axis.fill('150')

  await searchGlasses(page)

  const result = searchResult(page, sku)
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

test('S searches from a field that still needs formatting', async ({ page, createGlasses }) => {
  const { sku } = await createGlasses({ od: { sphere: 5.25 }, os: { sphere: 5.25 } })
  const eyeInput = new EyeInput(page)
  await open(page, '/find')
  await eyeInput.waitForAutofocus()

  await eyeInput.category.fill('s')
  await eyeInput.od.sphere.fill('5.2')
  await eyeInput.os.sphere.fill('5.2')
  await eyeInput.os.sphere.press('s')

  await expect(eyeInput.os.sphere).toHaveValue('5.25')
  await expect(searchResult(page, sku)).toBeVisible()
})

test('S shows the missing fields like the search button', async ({ page }) => {
  const eyeInput = new EyeInput(page)
  await page.goto('/find')
  await eyeInput.waitForAutofocus()

  await eyeInput.od.sphere.press('s')

  await expect(eyeInput.os.root.getByText('Required', { exact: true })).toBeVisible()
})

test('Holding S searches once and leaves Category alone', async ({ page, createGlasses }) => {
  const { sku } = await createGlasses({ od: { sphere: 5.5 }, os: { sphere: 5.5 } })
  const eyeInput = new EyeInput(page)
  await open(page, '/find')
  await eyeInput.waitForAutofocus()

  await eyeInput.category.fill('single')
  await eyeInput.od.sphere.fill('5.50')
  await eyeInput.os.sphere.fill('5.50')
  await page.keyboard.down('s')
  await expect(eyeInput.category).toBeFocused()
  await page.keyboard.down('s')
  await page.keyboard.up('s')

  await expect(eyeInput.category).toHaveValue('single')
  await expect(searchResult(page, sku)).toBeVisible()
})
