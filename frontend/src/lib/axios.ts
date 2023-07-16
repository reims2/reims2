import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export const useAxios = () => {
  const authStore = useAuthStore()
  const token = computed(() => authStore.accessToken)

  const instance = axios.create({
    timeout: 10000,
  })

  watchEffect(() => {
    instance.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token.value}`
      return config
    })
  })

  return instance
}
