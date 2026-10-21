type ToastColor = 'info' | 'warning' | 'error'

// Module-level so toasts survive layout switches, rendered by the queue in App.vue
export const toastQueue = ref<{ text: string; color: ToastColor }[]>([])

export const useToast = () => {
  const show = (color: ToastColor) => (text: string) => {
    toastQueue.value.push({ text, color })
  }
  return { info: show('info'), warning: show('warning'), error: show('error') }
}
