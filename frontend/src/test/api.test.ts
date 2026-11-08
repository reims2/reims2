import { createTestingPinia } from '@pinia/testing'
import { ApiError, fetchWithin, useApi } from '@/lib/api'
import { toastQueue } from '@/composables/toast'
import { useAuthStore } from '@/stores/auth'

const fetchMock = vi.fn<(request: Request, init?: RequestInit) => Promise<Response>>()

function respondWith(status: number, detail?: string) {
  fetchMock.mockResolvedValue(
    new Response(detail ? JSON.stringify({ status, detail }) : null, {
      status,
      headers: detail ? { 'Content-Type': 'application/problem+json' } : {},
    }),
  )
}

const getGlasses = () =>
  useApi().GET('/api/glasses/{location}/{sku}', { params: { path: { location: 'sa', sku: 1 } } })

const failure = (request: Promise<unknown>) =>
  request.then(
    () => expect.unreachable(),
    (error: ApiError) => error,
  )

describe('api client', () => {
  beforeEach(() => {
    createTestingPinia()
    toastQueue.value = []
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('maps a failed fetch to a network error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const error = await failure(getGlasses())
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ isNetwork: true, isServerSide: false, statusCode: null })
  })

  it('maps a 5xx to a server error with the problem detail', async () => {
    respondWith(503, 'Database error')
    const error = await failure(getGlasses())
    expect(error).toMatchObject({
      isNetwork: false,
      isServerSide: true,
      statusCode: 503,
      apiMessage: 'Database error',
    })
  })

  it('maps a 4xx to a client error with the problem detail', async () => {
    respondWith(409, 'No free SKUs left in this location.')
    const error = await failure(getGlasses())
    expect(error).toMatchObject({
      isNetwork: false,
      isServerSide: false,
      statusCode: 409,
      message: 'No free SKUs left in this location.',
    })
  })

  it('keeps the generic message without a problem detail', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }))
    const error = await failure(getGlasses())
    expect(error).toMatchObject({ message: 'Server error', apiMessage: null, statusCode: 502 })
  })

  it('passes a 304 through', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 304, headers: { ETag: '"abc"' } }))
    const { response } = await useApi().GET('/api/glasses/{location}/all', {
      params: { path: { location: 'sa' } },
    })
    expect(response.status).toBe(304)
  })

  it('logs out on a 401 while logged in', async () => {
    useAuthStore().user = 'ana'
    respondWith(401)
    const error = await failure(getGlasses())
    expect(error.message).toBe('Unauthorized')
    expect(useAuthStore().logout).toHaveBeenCalled()
    expect(toastQueue.value).toEqual([
      { color: 'warning', text: 'Your login has expired. Please log in again.' },
    ])
  })

  it('does not log out on a 401 from signin while logged out', async () => {
    respondWith(401, 'Bad credentials')
    const error = await failure(
      useApi().POST('/api/auth/signin', { body: { username: 'a', password: 'b' } }),
    )
    expect(error).toMatchObject({ statusCode: 401, apiMessage: 'Bad credentials' })
    expect(useAuthStore().logout).not.toHaveBeenCalled()
    expect(toastQueue.value).toEqual([])
  })

  it('sends the CSRF cookie as a header with changes only', async () => {
    document.cookie = 'XSRF-TOKEN=a%2Fb'
    fetchMock.mockImplementation(async () => Response.json({}))
    await getGlasses()
    await useApi().PUT('/api/glasses/{id}/dispense', { params: { path: { id: 1 } } })
    const headers = fetchMock.mock.calls.map(([request]) => request.headers.get('X-XSRF-TOKEN'))
    expect(headers).toEqual([null, 'a/b'])
    document.cookie = 'XSRF-TOKEN=; max-age=0'
  })

  it('aborts a request that takes too long', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(
      (request, init?: RequestInit) =>
        new Promise((_, reject) =>
          (init?.signal ?? request.signal).addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          ),
        ),
    )
    const pending = fetchWithin(1000)(new Request('http://localhost/api'))
    vi.advanceTimersByTime(1000)
    await expect(pending).rejects.toThrow('aborted')
  })

  it('aborts when the caller does', async () => {
    fetchMock.mockImplementation(
      (_request, init?: RequestInit) =>
        new Promise((_, reject) =>
          init!.signal!.addEventListener('abort', () => reject(new DOMException('aborted'))),
        ),
    )
    const controller = new AbortController()
    const pending = fetchWithin(1000)(
      new Request('http://localhost/api', { signal: controller.signal }),
    )
    controller.abort()
    await expect(pending).rejects.toThrow('aborted')
  })
})
