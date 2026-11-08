import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })))
vi.stubGlobal('fetch', fetchMock)

const requests = () => fetchMock.mock.calls.map((call) => (call as unknown as [Request])[0])
const sentBodies = () => Promise.all(requests().map((request) => request.clone().json()))
const settled = () => new Promise((resolve) => setTimeout(resolve))

// a fresh module per test resets the report cap
async function setup(user: string | null = 'ana') {
  vi.resetModules()
  setActivePinia(createPinia())
  const { useAuthStore } = await import('@/stores/auth')
  useAuthStore().user = user
  document.cookie = 'XSRF-TOKEN=token'
  return import('@/lib/error-report')
}

describe('error report', () => {
  beforeEach(() => fetchMock.mockClear())

  it('posts the page and message with the CSRF token', async () => {
    const { reportError } = await setup()
    reportError('boom')
    await settled()
    const [request] = requests()
    expect(new URL(request!.url).pathname).toBe('/api/clientErrors')
    expect(request!.method).toBe('POST')
    expect(request!.headers.get('X-XSRF-TOKEN')).toBe('token')
    expect((await sentBodies())[0]).toMatchObject({ message: '/: boom' })
  })

  it('stays quiet when logged out or for browser noise', async () => {
    ;(await setup(null)).reportError('boom')
    const { reportError } = await setup()
    reportError('ResizeObserver loop completed with undelivered notifications.')
    reportError('Script error.')
    await settled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('caps the reports per page', async () => {
    const { reportError } = await setup()
    for (let i = 0; i < 20; i++) reportError(`boom ${i}`)
    await settled()
    expect(fetchMock).toHaveBeenCalledTimes(10)
  })

  it('reports Vue errors and unhandled rejections, but not failed requests', async () => {
    const { installErrorReporting } = await setup()
    const { ApiError } = await import('@/lib/api')
    const app = createApp({})
    installErrorReporting(app)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    app.config.errorHandler!(new TypeError('x is undefined'), null, 'render function')
    window.dispatchEvent(
      Object.assign(new Event('unhandledrejection'), { reason: new Error('lost promise') }),
    )
    window.dispatchEvent(
      Object.assign(new Event('unhandledrejection'), {
        reason: new ApiError('Network error'),
      }),
    )

    await settled()
    const messages = (await sentBodies()).map((body) => body.message)
    expect(messages).toHaveLength(2)
    expect(messages[0]).toMatch(/TypeError: x is undefined[\s\S]*\(render function\)$/)
    expect(messages[1]).toMatch(/Error: lost promise/)
    expect(consoleError).toHaveBeenCalled()
  })

  it('describes non-errors as text', async () => {
    const { describeError } = await setup()
    expect(describeError('plain')).toBe('plain')
    expect(describeError({ toString: () => 'object' })).toBe('object')
  })
})
