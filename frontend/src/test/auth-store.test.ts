import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const token = (payload: object) => `x.${btoa(JSON.stringify(payload))}.x`

describe('auth store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('reads the expiration from the token', () => {
    const authStore = useAuthStore()
    authStore.accessToken = token({ exp: 1_800_000_000 })
    expect(authStore.expirationTime).toEqual(new Date(1_800_000_000_000))
  })

  it('treats an unreadable token as expired', () => {
    const authStore = useAuthStore()
    authStore.accessToken = 'not a token'
    expect(authStore.expirationTime!.getTime()).toBeLessThan(Date.now())
  })
})
