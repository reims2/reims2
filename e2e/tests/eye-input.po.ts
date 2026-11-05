import { Locator, Page, expect } from '@playwright/test'

type EyeRx = { sphere: string; cylinder: string; axis?: string; add?: string }
type GlassesForm = {
  category: string
  appearance?: string
  size?: string
  od: EyeRx
  os: EyeRx
}

const eyeFields = (root: Locator) => ({
  root,
  sphere: root.getByLabel('Sphere'),
  cylinder: root.getByLabel('Cylinder'),
  axis: root.getByLabel('Axis'),
  add: root.getByLabel('Additional'),
})

export class EyeInput {
  readonly category = this.page.getByRole('textbox', { name: 'Category', exact: true })
  readonly appearance = this.page.getByRole('textbox', { name: 'Frame appearance', exact: true })
  readonly size = this.page.getByRole('textbox', { name: 'Frame size', exact: true })

  readonly od = eyeFields(this.page.getByLabel('OD', { exact: true }))
  readonly os = eyeFields(this.page.getByLabel('OS', { exact: true }))

  constructor(readonly page: Page) {}

  // Vuetify focuses an autofocus field again 50ms after it scrolls into view (useAutofocus),
  // which pulls focus back to Category if typing has moved on by then
  async waitForAutofocus() {
    await expect(this.category).toBeFocused()
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(150)
  }

  async fill(form: GlassesForm) {
    await this.waitForAutofocus()
    await this.category.fill(form.category)
    if (form.appearance) await this.appearance.fill(form.appearance)
    if (form.size) await this.size.fill(form.size)
    await this.fillEye(this.od, form.od)
    await this.fillEye(this.os, form.os)
  }

  private async fillEye(eye: ReturnType<typeof eyeFields>, rx: EyeRx) {
    await eye.sphere.fill(rx.sphere)
    await eye.cylinder.fill(rx.cylinder)
    if (rx.axis) await eye.axis.fill(rx.axis)
    if (rx.add) await eye.add.fill(rx.add)
  }
}
