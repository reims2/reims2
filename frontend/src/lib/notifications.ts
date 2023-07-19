import { useRootStore } from '@/stores/root'
import { Fn, useTimeoutFn } from '@vueuse/core'

type NotificationConfig = {
  type: 'error' | 'success' | 'info'
  timeout?: number
}

export interface Notification {
  message: string
  type: string
}

export const useNotification = () => {
  const rootStore = useRootStore()
  const notification = computed(() => rootStore.notification)
  let stopTimeoutFn: Fn = () => {
    // not set by default
  }

  const addNotification = (message: string, conf?: NotificationConfig) => {
    rootStore.notification = { message, type: conf?.type || 'info' }

    stopTimeoutFn()
    const { stop } = useTimeoutFn(
      () => {
        removeNotification()
      },
      conf?.timeout ? conf.timeout : 10 * 1000,
      { immediate: true },
    )
    stopTimeoutFn = stop
  }

  const addError = (message: string) => {
    addNotification(message, { type: 'error', timeout: 5000 })
  }

  const removeNotification = () => {
    rootStore.notification = null
    stopTimeoutFn()
  }

  return {
    notification,
    addNotification,
    addError,
    removeNotification,
  }
}
