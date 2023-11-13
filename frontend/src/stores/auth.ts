import { defineStore, acceptHMRUpdate } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { useAxios } from '@/lib/axios'
import { UserRole } from '@/model/ReimsModel'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const axiosInstance = useAxios()
    const accessToken = ref(null as string | null)
    const roles = ref([] as UserRole[])
    const user = ref(null as string | null)

    const expirationTime = computed(() => {
      type Token = {
        exp: number
        iat: number
        sub: string
      }
      if (!accessToken.value) return null
      const token = jwtDecode(accessToken.value) as Token
      if (!token) return null
      return new Date(token.exp * 1000)
    })
    const isLoggedIn = computed(() => {
      return !!accessToken.value
    })

    async function login(username: string, password: string): Promise<void> {
      const response = await axiosInstance.post('/api/auth/signin', { username, password })
      accessToken.value = response.data.accessToken
      roles.value = response.data.roles
      user.value = response.data.username
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
