import { test as base, APIRequestContext } from '@playwright/test'

type ReimsSite = 'sa' | 'sm'
type Eye = { sphere: number; cylinder: number; axis: number; add: number }
export type Glasses = {
  id: number
  sku: number
  glassesType: 'single' | 'multifocal'
  od: Eye
  os: Eye
}
type NewGlasses = Partial<Pick<Glasses, 'glassesType' | 'od' | 'os'>>

export const formatSku = (sku: number) => sku.toString().padStart(4, '0')

export const test = base.extend<
  {
    location: ReimsSite
    createGlasses: (glasses?: NewGlasses) => Promise<Glasses>
  },
  { api: APIRequestContext }
>({
  location: ['sa', { option: true }],

  page: async ({ page, location }, use) => {
    if (location !== 'sa') {
      await page.addInitScript((site) => {
        localStorage.setItem('root', JSON.stringify({ reimsSite: site, drawer: true }))
      }, location)
    }
    await use(page)
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

  createGlasses: async ({ api, location }, use) => {
    const created: Glasses[] = []
    await use(async (glasses = {}) => {
      const eye = { sphere: 0.75, cylinder: 0, axis: 0, add: 0 }
      const response = await api.post('/api/glasses', {
        data: {
          glassesType: 'single',
          appearance: 'neutral',
          glassesSize: 'medium',
          od: eye,
          os: eye,
          ...glasses,
          location,
        },
      })
      if (!response.ok()) throw new Error(`Creating glasses failed: ${await response.text()}`)
      const newGlasses = await response.json()
      created.push(newGlasses)
      return newGlasses
    })
    // results are paginated, so leftovers from earlier runs could push a test's pair off page 1
    for (const { id, sku } of created) {
      const current = await api.get(`/api/glasses/${location}/${sku}`)
      // a dispensed SKU may already belong to another test's pair
      if (current.ok() && (await current.json()).id === id) {
        await api.delete(`/api/glasses/${location}/${sku}`)
      }
    }
  },
})
export { expect } from '@playwright/test'
