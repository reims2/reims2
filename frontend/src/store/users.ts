import type { ActionTree, MutationTree } from 'vuex'
import { RootState } from '.'
import { User } from '~/model/UserModel'

export interface UsersState {
}
export const state = (): UsersState => ({
})

export const MutationType = {
}
export const mutations: MutationTree<UsersState> = {
}

export const ActionType = {
  ADD_USER: 'add',
  DELETE_USER: 'delete',
  GET_USERS: 'get'
}
export const actions: ActionTree<UsersState, RootState> = {
  async [ActionType.ADD_USER](_, newGlasses:User) : Promise<User> {
    const data : User = await this.$axios.$post('/api/auth/signup', newGlasses)
    return data
  },
  async [ActionType.DELETE_USER](_, id:number) {
    await this.$axios.$delete(`/api/auth/${id}`)
  },
  async [ActionType.GET_USERS](_) : Promise<Array<User>> {
    const data : Array<User> = await this.$axios.$get('/api/auth')
    return data
  }

}
