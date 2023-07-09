import { User } from '@/model/UserModel'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useUsersStore = defineStore({
  id: 'users',
  actions: {
    async add(newGlasses: User): Promise<User> {
      const data: User = await axios.post('/api/auth/signup', newGlasses)
      return data
    },
    async delete(id: number) {
      await axios.delete(`/api/auth/${id}`)
    },
    async get(): Promise<Array<User>> {
      const data: Array<User> = await axios.get('/api/auth')
      return data
    },
  },
})
