import { createTestingPinia } from '@pinia/testing'
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios'
import { ReimsAxiosError, useAxios } from '@/lib/axios'
import { toastQueue } from '@/composables/toast'
import { useAuthStore } from '@/stores/auth'

function failWith(status: number | null, url = '/api/glasses/sa/1', detail?: string) {
  const instance = useAxios()
  instance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    if (status == null) throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    const response = {
      status,
      statusText: '',
      data: detail ? { status, detail } : null,
      headers: {},
      config,
    }
    throw new AxiosError('failed', 'ERR_BAD_RESPONSE', config, { responseURL: url }, response)
  }
  return instance.get(url).then(
    () => expect.unreachable(),
    (error: ReimsAxiosError) => error,
  )
}

describe('axios error mapping', () => {
  beforeEach(() => {
    createTestingPinia()
    toastQueue.value = []
  })

  it('maps a missing response to a network error', async () => {
    const error = await failWith(null)
    expect(error).toBeInstanceOf(ReimsAxiosError)
    expect(error).toMatchObject({ isNetwork: true, isServerSide: false, statusCode: null })
  })

  it('maps a 5xx to a server error with the problem detail', async () => {
    const error = await failWith(503, undefined, 'Database error')
    expect(error).toMatchObject({
      isNetwork: false,
      isServerSide: true,
      isClientSide: false,
      statusCode: 503,
      apiMessage: 'Database error',
    })
  })

  it('maps a 4xx to a client error with the problem detail', async () => {
    const error = await failWith(409, undefined, 'No free SKUs left in this location.')
    expect(error).toMatchObject({
      isClientSide: true,
      statusCode: 409,
      apiMessage: 'No free SKUs left in this location.',
    })
  })

  it('logs out on a 401 from the API', async () => {
    const error = await failWith(401)
    expect(error.message).toBe('Unauthorized')
    expect(useAuthStore().logout).toHaveBeenCalled()
    expect(toastQueue.value).toEqual([
      { color: 'warning', text: 'Your login has expired. Please log in again.' },
    ])
  })

  it('does not log out on a 401 from signin', async () => {
    const error = await failWith(401, 'http://localhost/api/auth/signin')
    expect(error.statusCode).toBe(401)
    expect(useAuthStore().logout).not.toHaveBeenCalled()
    expect(toastQueue.value).toEqual([])
  })

  it('sends the token only when logged in', async () => {
    const authStore = useAuthStore()
    const instance = useAxios()
    const headers: (string | undefined)[] = []
    instance.defaults.adapter = async (config) => {
      headers.push(AxiosHeaders.from(config.headers).get('Authorization') as string | undefined)
      return { status: 200, statusText: 'OK', data: null, headers: {}, config }
    }
    authStore.accessToken = 'abc'
    await instance.get('/api/glasses/sa/all')
    authStore.accessToken = null
    await instance.get('/api/glasses/sa/all')
    expect(headers).toEqual(['Bearer abc', undefined])
  })
})
