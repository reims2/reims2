import { User } from '@/model/UserModel'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useAxios } from '@/lib/axios'

export const useUsersStore = defineStore('users', () => {
  const axiosInstance = useAxios()
  async function add(newGlasses: User): Promise<User> {
    const response = await axiosInstance.post('/api/auth/signup', newGlasses)
    return response.data
  }
  async function deleteUser(id: number) {
    await axiosInstance.delete(`/api/auth/${id}`)
  }
  async function get(): Promise<Array<User>> {
    const response = await axiosInstance.get('/api/auth')
    return response.data
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
