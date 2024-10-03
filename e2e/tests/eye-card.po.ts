import { expect, Page } from '@playwright/test'

export class EyeCard {
  readonly category = this.page.getByLabel('Category')
  readonly appearance = this.page.getByLabel('Frame appearance')
  readonly size = this.page.getByLabel('Frame size')

  readonly odInput = this.page.getByTestId('OD-card')
  readonly osInput = this.page.getByTestId('OS-card')

  readonly odSphere = this.odInput.getByLabel('Sphere')
  readonly odCylinder = this.odInput.getByLabel('Cylinder')
  readonly odAxis = this.odInput.getByLabel('Axis')
  readonly odAdditional = this.odInput.getByLabel('Additional')

  readonly osSphere = this.osInput.getByLabel('Sphere')
  readonly osCylinder = this.osInput.getByLabel('Cylinder')
  readonly osAxis = this.osInput.getByLabel('Axis')
  readonly osAdditional = this.osInput.getByLabel('Additional')

  constructor(readonly page: Page) {}
}
