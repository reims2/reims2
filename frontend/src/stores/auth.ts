import { defineStore, acceptHMRUpdate } from 'pinia'
import jwtDecode from 'jwt-decode'
import { useAxios } from '@/lib/axios'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const axiosInstance = useAxios()
    const accessToken = ref(null as string | null)
    const roles = ref([] as string[])
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

    async function login(username: string, password: string) {
      const response = await axiosInstance.post('/api/auth/signin', { username, password })
      accessToken.value = response.data.accessToken
      fetchUser()
    }
    async function fetchUser() {
      const response = await axiosInstance.get('/api/auth/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      roles.value = response.data.roles.map((role: any) => role.name)
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
      fetchUser,
      logout,
    }
  },
  { persist: true },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
