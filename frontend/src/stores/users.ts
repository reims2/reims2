import { User } from '@/model/UserModel'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useUsersStore = defineStore({
  id: 'users',
  actions: {
    async addUser(newGlasses:User) : Promise<User> {
      const data : User = await axios.post('/api/auth/signup', newGlasses)
      return data
    },
    async deleteUser(id:number) {
      await axios.delete(`/api/auth/${id}`)
    },
    async getUsers() : Promise<Array<User>> {
      const data : Array<User> = await axios.get('/api/auth')
      return data
    }
  }

})
