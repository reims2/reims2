import { createApp } from 'vue'
import { describeError, installErrorReporting, reportError } from '@/lib/error-report'
import { ReimsAxiosError } from '@/lib/axios'

const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })))
vi.stubGlobal('fetch', fetchMock)

let token: string | null = 'token'
const app = createApp({})

const sentBodies = () =>
  fetchMock.mock.calls.map((call) =>
    JSON.parse((call as unknown as [string, RequestInit])[1].body as string),
  )

describe('error report', () => {
  beforeEach(() => {
    token = 'token'
    installErrorReporting(app, () => token)
    fetchMock.mockClear()
  })

  it('posts the page and message with the token', () => {
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

  it('stays quiet when logged out, offline or for browser noise', () => {
    token = null
    reportError('boom')
    token = 'token'
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false)
    reportError('boom')
    reportError('ResizeObserver loop completed with undelivered notifications.')
    reportError('Script error.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('caps the reports per page', () => {
    for (let i = 0; i < 20; i++) reportError(`boom ${i}`)
    expect(fetchMock).toHaveBeenCalledTimes(10)
  })

  it('reports Vue errors and unhandled rejections, but not failed requests', () => {
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
    window.dispatchEvent(Object.assign(new Event('error'), { error: new RangeError('too deep') }))

    const messages = sentBodies().map((body) => body.message)
    expect(messages).toHaveLength(3)
    expect(messages[0]).toMatch(/TypeError: x is undefined[\s\S]*\(render function\)$/)
    expect(messages[1]).toMatch(/Error: lost promise/)
    expect(messages[2]).toMatch(/RangeError: too deep/)
    expect(consoleError).toHaveBeenCalled()
  })

  it('describes non-errors as text', () => {
    expect(describeError('plain')).toBe('plain')
    expect(describeError({ toString: () => 'object' })).toBe('object')
  })
})
