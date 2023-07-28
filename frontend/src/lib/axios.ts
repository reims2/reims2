import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

export const useAxios = () => {
  const authStore = useAuthStore()
  const toast = useToast()
  const token = computed(() => authStore.accessToken)

  const instance = axios.create({
    timeout: 8000,
  })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      error.status = error.response ? error.response.status : 'Network Error'
      if (!error.response) {
        error.network = true
      } else if (error.response.status >= 500) {
        error.server = true
      }

      try {
        error.message = error.response.data.message
      } catch (e) {
        error.message = ''
      }

      if (error.response.status === 401) {
        toast.error('Credentials no longer valid. Please log in again.')
        authStore.logout()
      }
      throw error
    },
  )

  watchEffect(() => {
    instance.interceptors.request.use((config) => {
      if (token != null) config.headers.Authorization = `Bearer ${token.value}`
      else delete config.headers.Authorization
      return config
    })
  })

  return instance
}
