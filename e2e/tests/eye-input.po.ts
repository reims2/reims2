import { Locator, Page, expect } from '@playwright/test'

export type EyeRx = { sphere: string; cylinder: string; axis?: string; add?: string }
type GlassesForm = {
  category: string
  appearance?: string
  size?: string
  od: EyeRx
  os: EyeRx
}

export class EyeInput {
  readonly category = this.page.getByLabel('Category')
  readonly appearance = this.page.getByLabel('Frame appearance')
  readonly size = this.page.getByLabel('Frame size')

  readonly odInput = this.page.getByLabel('OD', { exact: true })
  readonly osInput = this.page.getByLabel('OS', { exact: true })

  readonly odSphere = this.odInput.getByLabel('Sphere')
  readonly odCylinder = this.odInput.getByLabel('Cylinder')
  readonly odAxis = this.odInput.getByLabel('Axis')
  readonly odAdditional = this.odInput.getByLabel('Additional')

  readonly osSphere = this.osInput.getByLabel('Sphere')
  readonly osCylinder = this.osInput.getByLabel('Cylinder')
  readonly osAxis = this.osInput.getByLabel('Axis')
  readonly osAdditional = this.osInput.getByLabel('Additional')

  constructor(readonly page: Page) {}

  // Category autofocuses after a delay, typing before that can land in it
  async waitForAutofocus() {
    await expect(this.category).toBeFocused()
  }

  async fill(form: GlassesForm) {
    await this.waitForAutofocus()
    await this.category.fill(form.category)
    if (form.appearance) await this.appearance.fill(form.appearance)
    if (form.size) await this.size.fill(form.size)
    await this.fillEye(this.odInput, form.od)
    await this.fillEye(this.osInput, form.os)
  }

  private async fillEye(eye: Locator, rx: EyeRx) {
    await eye.getByLabel('Sphere').fill(rx.sphere)
    await eye.getByLabel('Cylinder').fill(rx.cylinder)
    if (rx.axis) await eye.getByLabel('Axis').fill(rx.axis)
    if (rx.add) await eye.getByLabel('Additional').fill(rx.add)
  }
}
