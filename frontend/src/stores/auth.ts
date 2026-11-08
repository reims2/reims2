import { defineStore, acceptHMRUpdate } from 'pinia'
import { useApi } from '@/lib/api'
import { UserRole } from '@/model/ReimsModel'

// the session cookie itself is HttpOnly, so this only mirrors who logged in
export const useAuthStore = defineStore(
  'auth',
  () => {
    const api = useApi()
    const roles = ref([] as UserRole[])
    const user = ref(null as string | null)

    const isLoggedIn = computed(() => !!user.value)

    async function login(username: string, password: string): Promise<void> {
      const { data } = await api.POST('/api/auth/signin', { body: { username, password } })
      roles.value = data!.roles as UserRole[]
      user.value = data!.username
    }

    function logout() {
      // offline or already expired, the session ends on the server by itself
      if (user.value) api.POST('/api/auth/signout').catch(() => {})
      roles.value = []
      user.value = null
    }
    return {
      roles,
      user,
      isLoggedIn,
      login,
      logout,
    }
  },
  { persist: { pick: ['roles', 'user'] } },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
