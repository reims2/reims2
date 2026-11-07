import { test as base, expect, APIRequestContext, Page } from '@playwright/test'

type Eye = { sphere: number; cylinder: number; axis: number; add: number }
type Glasses = {
  id: number
  sku: number
  glassesType: 'single' | 'multifocal'
  od: Eye
  os: Eye
}
type NewGlasses = {
  glassesType?: Glasses['glassesType']
  location?: 'sa' | 'sm'
  od?: Partial<Eye>
  os?: Partial<Eye>
}

export const formatSku = (sku: number) => sku.toString().padStart(4, '0')

// every page load fetches all glasses of the site, even with a cached copy
export const glassesLoaded = (page: Page) =>
  page.waitForResponse((r) => r.url().endsWith('/all') && r.ok())

export async function open(page: Page, path: string) {
  const loaded = glassesLoaded(page)
  await page.goto(path)
  await loaded
}

export async function lookUpSku(page: Page, sku: number) {
  await page.getByLabel('SKU', { exact: true }).fill(formatSku(sku))
  await expect(page.getByLabel('Glasses result')).toBeVisible()
}

export const searchGlasses = (page: Page) =>
  page.getByRole('button', { name: 'earch glasses' }).click()

export const searchResult = (page: Page, sku: number) =>
  page.getByLabel('Results').getByRole('group', { name: `SKU ${formatSku(sku)}` })

export const test = base.extend<
  {
    addedIds: number[]
    createGlasses: (glasses?: NewGlasses) => Promise<Glasses>
  },
  { api: APIRequestContext }
>({
  // results are paginated, so leftovers from earlier runs could push a test's pair off page 1.
  // There's no hard delete, and a pair a test already dispensed is left as it is.
  addedIds: async ({ api }, use) => {
    const ids: number[] = []
    await use(ids)
    await Promise.all(ids.map((id) => api.put(`/api/glasses/${id}/dispense?reason=WRONGLY_ADDED`)))
  },

  page: async ({ page, addedIds }, use) => {
    const added: Promise<void>[] = []
    page.on('response', (r) => {
      if (r.request().method() === 'POST' && r.url().endsWith('/api/glasses') && r.ok()) {
        added.push(r.json().then(({ id }) => void addedIds.push(id)))
      }
    })
    await use(page)
    await Promise.all(added)
  },

  // test data goes through the API, the UI flows are covered by their own specs
  api: [
    async ({ playwright }, use, workerInfo) => {
      const baseURL = workerInfo.project.use.baseURL
      const login = await playwright.request.newContext({ baseURL })
      const response = await login.post('/api/auth/signin', {
        data: { username: 'test', password: 'testtest' },
      })
      const { accessToken } = await response.json()
      await login.dispose()

      const api = await playwright.request.newContext({
        baseURL,
        extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
      })
      await use(api)
      await api.dispose()
    },
    { scope: 'worker' },
  ],

  createGlasses: async ({ api, addedIds }, use) => {
    await use(async ({ od, os, ...glasses } = {}) => {
      const eye = { sphere: 0.75, cylinder: 0, axis: 0, add: 0 }
      const response = await api.post('/api/glasses', {
        data: {
          glassesType: 'single',
          appearance: 'neutral',
          glassesSize: 'medium',
          location: 'sa',
          ...glasses,
          od: { ...eye, ...od },
          os: { ...eye, ...os },
        },
      })
      if (!response.ok()) throw new Error(`Creating glasses failed: ${await response.text()}`)
      const newGlasses = await response.json()
      addedIds.push(newGlasses.id)
      return newGlasses
    })
  },
})
export { expect }
