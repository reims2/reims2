import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const api = vi.hoisted(() => ({ POST: vi.fn() }))
vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  useApi: () => api,
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    api.POST.mockResolvedValue({})
  })

  it('remembers the user and when the login ends', async () => {
    api.POST.mockResolvedValue({
      data: { id: 1, username: 'ana', roles: ['ROLE_USER'] },
    })
    const authStore = useAuthStore()
    await authStore.login('ana', 'secret')
    expect(api.POST).toHaveBeenCalledWith('/api/auth/signin', {
      body: { username: 'ana', password: 'secret' },
    })
    expect(authStore.isLoggedIn).toBe(true)
    expect(authStore.roles).toEqual(['ROLE_USER'])
  })

  it('ends the session on the server when logging out', () => {
    const authStore = useAuthStore()
    authStore.user = 'ana'
    authStore.logout()
    expect(api.POST).toHaveBeenCalledWith('/api/auth/signout')
    expect(authStore.isLoggedIn).toBe(false)
  })

  it('logs out locally when the server is unreachable', async () => {
    api.POST.mockRejectedValue(new Error('offline'))
    const authStore = useAuthStore()
    authStore.user = 'ana'
    authStore.logout()
    await Promise.resolve()
    expect(authStore.isLoggedIn).toBe(false)
  })

  it('has nothing to end when nobody is logged in', () => {
    useAuthStore().logout()
    expect(api.POST).not.toHaveBeenCalled()
  })
})
