import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from '@/model/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/toast'

export class ApiError extends Error {
  statusCode: number | null
  apiMessage: string | null
  /** No status code means the request got no response */
  constructor(message: string, statusCode: number | null = null, apiMessage: string | null = null) {
    // the server's problem detail says more than the generic message
    super(apiMessage ?? message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.apiMessage = apiMessage
  }
  get isNetwork() {
    return this.statusCode === null
  }
  get isServerSide() {
    return (this.statusCode ?? 0) >= 500
  }
}

// RFC 9457 problem details
async function problemDetail(response: Response): Promise<string | null> {
  try {
    return ((await response.json()) as { detail?: string }).detail || null
  } catch {
    return null
  }
}

/** The token Spring Security also set as a cookie, a cross-site page can't read it */
function csrfToken(): string | undefined {
  const token = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1]
  return token ? decodeURIComponent(token) : undefined
}

/** Fails a request whose response headers take longer than ms, like an aborted one. */
export function fetchWithin(ms: number) {
  return (request: Request) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), ms)
    if (request.signal.aborted) controller.abort()
    request.signal.addEventListener('abort', () => controller.abort())
    return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer))
  }
}

export const useApi = () => {
  const authStore = useAuthStore()
  const toast = useToast()

  const middleware: Middleware = {
    onRequest({ request }) {
      const token = csrfToken()
      if (request.method !== 'GET' && token) request.headers.set('X-XSRF-TOKEN', token)
    },
    // only fetch itself fails here: offline, aborted or timed out
    onError() {
      return new ApiError('Network error')
    },
    async onResponse({ response }) {
      if (response.ok || response.status === 304) return
      const apiMessage = await problemDetail(response)
      if (response.status >= 500) {
        throw new ApiError('Server error', response.status, apiMessage)
      }
      // logged out, a 401 is just a failed signin
      if (response.status === 401 && authStore.isLoggedIn) {
        toast.warning('Your login has expired. Please log in again.')
        authStore.logout()
        throw new ApiError('Unauthorized', 401)
      }
      throw new ApiError(`Error ${response.status}`, response.status, apiMessage)
    },
  }

  const client = createClient<paths>({ baseUrl: location.origin, fetch: fetchWithin(12000) })
  client.use(middleware)
  return client
}
