import type { App } from 'vue'
import type { components } from '@/model/api'
import { ApiError, useApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

// a page stuck in an error loop shouldn't flood the server
const MAX_REPORTS = 10
// noise from the browser or extensions, nothing the app can fix
const IGNORED = [/ResizeObserver loop/, /^Script error\.?$/]

let reports = 0

export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}\n${error.stack ?? ''}`.trim()
  return String(error)
}

/** Sends a report in the background, only while logged in. */
export function reportError(message: string) {
  if (!useAuthStore().isLoggedIn || reports >= MAX_REPORTS) return
  if (IGNORED.some((pattern) => pattern.test(message))) return
  reports++
  const body: components['schemas']['ClientErrorDTO'] = {
    message: `${location.pathname}: ${message}`.slice(0, 2000),
    version: import.meta.env.VITE_GIT_VERSION,
  }
  useApi()
    .POST('/api/clientErrors', { body, keepalive: true })
    .catch(() => {})
}

export function installErrorReporting(app: App) {
  app.config.errorHandler = (error, _instance, info) => {
    console.error(error)
    reportError(`${describeError(error)} (${info})`)
  }
  // failed requests are the server's metrics or an offline device, not a bug here
  window.addEventListener('unhandledrejection', (event) => {
    if (!(event.reason instanceof ApiError)) reportError(describeError(event.reason))
  })
}
