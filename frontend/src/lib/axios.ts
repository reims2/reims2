import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/toast'

export class ReimsAxiosError extends Error {
  isNetwork: boolean
  isServerSide: boolean
  statusCode: number | null
  apiMessage: string | null
  constructor(
    message: string,
    isNetwork = false,
    isServer = false,
    apiMessage: string | null = null,
    statusCode: number | null = null,
  ) {
    // the server's problem detail says more than the generic message
    super(apiMessage ?? message)
    this.name = 'ReimsAxiosError'
    this.isNetwork = isNetwork
    this.isServerSide = isServer
    this.apiMessage = apiMessage
    this.statusCode = statusCode
  }
}

// RFC 9457 problem details
type ApiErrorResponse = {
  detail?: string
  status: number
}

export const useAxios = () => {
  const authStore = useAuthStore()
  const toast = useToast()

  const instance = axios.create({
    timeout: 12000,
  })

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (!error.response) {
        throw new ReimsAxiosError('Network error', true)
      }
      const request = error.request as XMLHttpRequest | null
      const requestUrl = request?.responseURL || null
      const apiError = error.response.data as ApiErrorResponse | null
      const apiMessage = apiError?.detail || null

      if (error.response.status >= 500) {
        throw new ReimsAxiosError('Server error', false, true, apiMessage, error.response.status)
      }

      if (error.response.status === 401 && !(requestUrl && requestUrl.includes('/api/auth'))) {
        toast.warning('Your login has expired. Please log in again.')
        authStore.logout()
        throw new ReimsAxiosError('Unauthorized', false, false, null, 401)
      }

      throw new ReimsAxiosError(
        `Error ${error.response.status}`,
        false,
        false,
        apiMessage,
        error.response.status,
      )
    },
  )

  instance.interceptors.request.use((config) => {
    const token = authStore.accessToken
    if (token != null) config.headers.Authorization = `Bearer ${token}`
    else delete config.headers.Authorization
    return config
  })

  return instance
}
