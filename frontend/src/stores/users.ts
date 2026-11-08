import type { components } from '@/model/api'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useApi } from '@/lib/api'

export type User = components['schemas']['UserResponse']
type SignupRequest = components['schemas']['SignupRequest']

export const useUsersStore = defineStore('users', () => {
  const api = useApi()
  async function add(newUser: SignupRequest) {
    await api.POST('/api/auth/signup', { body: newUser })
  }
  async function deleteUser(id: number) {
    await api.DELETE('/api/auth/{id}', { params: { path: { id } } })
  }
  async function get(): Promise<User[]> {
    return (await api.GET('/api/auth')).data!
  }
  return {
    add,
    deleteUser,
    get,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
}
