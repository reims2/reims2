import type { App } from 'vue'
import type { components } from '@/model/api'
import { ReimsAxiosError } from '@/lib/axios'

// a page stuck in an error loop shouldn't flood the server
const MAX_REPORTS = 10
// noise from the browser or extensions, nothing the app can fix
const IGNORED = [/ResizeObserver loop/, /^Script error\.?$/]

let getToken: () => string | null = () => null
let reports = 0
let listening = false

export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}\n${error.stack ?? ''}`.trim()
  return String(error)
}

/** Sends a report in the background, only while logged in and online. */
export function reportError(message: string) {
  const token = getToken()
  if (!token || !navigator.onLine || reports >= MAX_REPORTS) return
  if (IGNORED.some((pattern) => pattern.test(message))) return
  reports++
  const body: components['schemas']['ClientErrorDTO'] = {
    message: `${location.pathname}: ${message}`.slice(0, 2000),
    version: import.meta.env.VITE_GIT_VERSION?.slice(0, 64),
  }
  fetch('/api/clientErrors', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).catch(() => {})
}

export function installErrorReporting(app: App, tokenGetter: () => string | null) {
  getToken = tokenGetter
  reports = 0
  app.config.errorHandler = (error, _instance, info) => {
    console.error(error)
    reportError(`${describeError(error)} (${info})`)
  }
  if (listening) return
  listening = true
  window.addEventListener('error', (event) =>
    reportError(describeError(event.error ?? event.message)),
  )
  // failed requests are the server's metrics or an offline device, not a bug here
  window.addEventListener('unhandledrejection', (event) => {
    if (!(event.reason instanceof ReimsAxiosError)) reportError(describeError(event.reason))
  })
}
