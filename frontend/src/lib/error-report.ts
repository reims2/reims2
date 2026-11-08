import type { App } from 'vue'
import type { components } from '@/model/api'
import { ReimsAxiosError } from '@/lib/axios'
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
  const token = useAuthStore().accessToken
  if (!token || reports >= MAX_REPORTS) return
  if (IGNORED.some((pattern) => pattern.test(message))) return
  reports++
  const body: components['schemas']['ClientErrorDTO'] = {
    message: `${location.pathname}: ${message}`.slice(0, 2000),
    version: import.meta.env.VITE_GIT_VERSION,
  }
  fetch('/api/clientErrors', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).catch(() => {})
}

export function installErrorReporting(app: App) {
  app.config.errorHandler = (error, _instance, info) => {
    console.error(error)
    reportError(`${describeError(error)} (${info})`)
  }
  // failed requests are the server's metrics or an offline device, not a bug here
  window.addEventListener('unhandledrejection', (event) => {
    if (!(event.reason instanceof ReimsAxiosError)) reportError(describeError(event.reason))
  })
}
