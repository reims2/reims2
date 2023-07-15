import { useRootStore } from '@/stores/root'

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
  const snackTimeout = ref<any | null>(null)

  const addNotification = (message: string, conf?: NotificationConfig) => {
    rootStore.notification = { message, type: conf?.type || 'info' }

    clearTimeout(snackTimeout.value)
    snackTimeout.value = setTimeout(
      () => {
        removeNotification()
      },
      conf?.timeout ? conf.timeout : 10 * 1000,
    )
  }

  const addError = (message: string) => {
    addNotification(message, { type: 'error', timeout: 5000 })
  }

  const removeNotification = () => {
    rootStore.notification = null
  }
  onBeforeUnmount(() => {
    clearTimeout(snackTimeout.value)
  })

  return {
    notification,
    addNotification,
    addError,
    removeNotification,
  }
}
