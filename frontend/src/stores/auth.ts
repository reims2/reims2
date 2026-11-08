import { defineStore, acceptHMRUpdate } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { useApi } from '@/lib/api'
import { UserRole } from '@/model/ReimsModel'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const api = useApi()
    const accessToken = ref(null as string | null)
    const roles = ref([] as UserRole[])
    const user = ref(null as string | null)

    const expirationTime = computed(() => {
      if (!accessToken.value) return null
      try {
        return new Date(jwtDecode<{ exp: number }>(accessToken.value).exp * 1000)
      } catch {
        // an unreadable token counts as expired, so the router logs out instead of throwing
        return new Date(0)
      }
    })
    const isLoggedIn = computed(() => !!accessToken.value)

    async function login(username: string, password: string): Promise<void> {
      const { data } = await api.POST('/api/auth/signin', { body: { username, password } })
      accessToken.value = data!.accessToken
      roles.value = data!.roles as UserRole[]
      user.value = data!.username
    }

    function logout() {
      accessToken.value = null
      roles.value = []
      user.value = null
    }
    return {
      accessToken,
      roles,
      user,
      expirationTime,
      isLoggedIn,
      login,
      logout,
    }
  },
  { persist: true },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
