import AxeBuilder from '@axe-core/playwright'
import { test, expect } from './fixtures'

// Vuetify gives nav lists role=list but their link items role=link, with no listitem in between
const knownViolations = ['aria-required-children']

for (const path of ['/find', '/add', '/edit', '/view', '/manage/reports', '/manage/users']) {
  test(`No new accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('main')).toBeVisible()
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(knownViolations)
      .analyze()
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
  })
}
