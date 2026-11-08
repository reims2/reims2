import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })))
vi.stubGlobal('fetch', fetchMock)

const sentBodies = () =>
  fetchMock.mock.calls.map((call) =>
    JSON.parse((call as unknown as [string, RequestInit])[1].body as string),
  )

// a fresh module per test resets the report cap
async function setup(token: string | null = 'token') {
  vi.resetModules()
  setActivePinia(createPinia())
  const { useAuthStore } = await import('@/stores/auth')
  useAuthStore().accessToken = token
  return import('@/lib/error-report')
}

describe('error report', () => {
  beforeEach(() => fetchMock.mockClear())

  it('posts the page and message with the token', async () => {
    const { reportError } = await setup()
    reportError('boom')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/clientErrors',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      }),
    )
    expect(sentBodies()[0]).toMatchObject({ message: '/: boom' })
  })

  it('stays quiet when logged out or for browser noise', async () => {
    ;(await setup(null)).reportError('boom')
    const { reportError } = await setup()
    reportError('ResizeObserver loop completed with undelivered notifications.')
    reportError('Script error.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('caps the reports per page', async () => {
    const { reportError } = await setup()
    for (let i = 0; i < 20; i++) reportError(`boom ${i}`)
    expect(fetchMock).toHaveBeenCalledTimes(10)
  })

  it('reports Vue errors and unhandled rejections, but not failed requests', async () => {
    const { installErrorReporting } = await setup()
    const { ReimsAxiosError } = await import('@/lib/axios')
    const app = createApp({})
    installErrorReporting(app)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    app.config.errorHandler!(new TypeError('x is undefined'), null, 'render function')
    window.dispatchEvent(
      Object.assign(new Event('unhandledrejection'), { reason: new Error('lost promise') }),
    )
    window.dispatchEvent(
      Object.assign(new Event('unhandledrejection'), {
        reason: new ReimsAxiosError('Network error', true),
      }),
    )

    const messages = sentBodies().map((body) => body.message)
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
