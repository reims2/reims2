import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

export class ReimsAxiosError extends Error {
  isNetwork: boolean
  isServerSide: boolean
  isClientSide: boolean
  statusCode: number | null
  apiMessage: string | null
  constructor(
    message: string,
    isNetwork = false,
    isServer = false,
    apiMessage: string | null = null,
    statusCode: number | null = null,
  ) {
    super(message)
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ReimsAxiosError.prototype)
    this.name = 'ReimsAxiosError'
    this.isNetwork = isNetwork
    this.isServerSide = isServer
    this.apiMessage = apiMessage
    this.isClientSide = !isNetwork && !isServer
    this.statusCode = statusCode
  }
}

type ApiErrorResponse = {
  message: string
  timestamp: number
  status: number
}

export const useAxios = () => {
  const authStore = useAuthStore()
  const toast = useToast()
  const token = computed(() => authStore.accessToken)

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
      const apiMessage = apiError?.message || null

      if (error.response.status >= 500) {
        throw new ReimsAxiosError('Server error', false, true, apiMessage, error.response.status)
      }

      if (error.response.status === 401 && !(requestUrl && requestUrl.includes('/api/auth'))) {
        toast.warning('Credentials no longer valid. Please reload to log in again.')
        authStore.logout()
        throw new ReimsAxiosError('Unauthorized')
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

  watchEffect(() => {
    instance.interceptors.request.use((config) => {
      if (token.value != null) config.headers.Authorization = `Bearer ${token.value}`
      else delete config.headers.Authorization
      return config
    })
  })

  return instance
}
