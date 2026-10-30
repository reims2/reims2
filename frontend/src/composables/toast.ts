type ToastColor = 'info' | 'warning' | 'error'

// Module-level so toasts survive layout switches, rendered by the queue in App.vue
export const toastQueue = ref<{ text: string; color: ToastColor; timeout?: number }[]>([])

export const useToast = () => {
  const show = (color: ToastColor) => (text: string) => {
    // errors stay until closed so they can't be missed
    toastQueue.value.push(color === 'error' ? { text, color, timeout: -1 } : { text, color })
  }
  return { info: show('info'), warning: show('warning'), error: show('error') }
}
