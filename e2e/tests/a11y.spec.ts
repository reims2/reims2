import AxeBuilder from '@axe-core/playwright'
import { test, expect } from './fixtures'

// violations the app already had when this check was added, drop rules here as they get fixed
const knownViolations = ['aria-required-children', 'button-name', 'color-contrast', 'link-name']

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
