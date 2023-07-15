<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols="12" md="6" lg="5">
        <v-simple-table v-if="items.length > 0">
          <thead>
            <tr>
              <th class="text-left">Username</th>
              <th class="text-left">Roles</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.username">
              <td :class="isCurrentUser(item.username) ? 'font-weight-bold' : ''">
                {{ item.username }}
              </td>
              <td>{{ item.roles.map((el) => el.name).join(', ') }}</td>
              <td>
                <v-btn v-if="!editInfo" icon @click="editInfo = true">
                  <v-icon>{{ mdiPencil }}</v-icon>
                </v-btn>
                <v-btn
                  v-if="!isCurrentUser(item.username)"
                  icon
                  color="error"
                  :loading="deleteLoading == item.id"
                  @click="deleteUser(item.id!)"
                >
                  <v-icon>{{ mdiDelete }}</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
        <v-alert v-else type="warning" outlined dense>No users loaded.</v-alert>

        <v-alert v-if="editInfo" type="info" outlined dense class="mt-4" dismissible>
          If you want to edit an existing user, you have to delete and re-add them.
        </v-alert>
        <v-dialog v-model="dialog" max-width="500px" persistent>
          <template #activator="{ props }">
            <v-btn color="primary" dark v-bind="props" class="mt-3">Add new user</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">Add a new user</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-container>
                  <v-alert v-if="newRoles.includes('ROLE_ADMIN')" type="warning" dense prominent>
                    Users with the admin role can add and delete users, so be careful to apply that
                    role only when necessary.
                  </v-alert>
                  <v-row dense>
                    <v-col cols="12">
                      <v-text-field
                        v-model="newName"
                        label="Username"
                        :rules="[(v) => !!v || 'Item is required']"
                        required
                        autocorrect="off"
                        autocapitalize="off"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="newPassword"
                        label="Password"
                        type="password"
                        :rules="[(v) => !!v || 'Item is required']"
                        required
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        v-model="newRoles"
                        :items="['ROLE_USER', 'ROLE_ADMIN']"
                        multiple
                        label="Roles"
                        :rules="[(v) => v.length > 0 || 'Item is required']"
                        required
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
              <v-btn
                color="primary"
                variant="text"
                :disabled="!valid"
                :loading="addLoading"
                @click="addUser()"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import { mdiDelete, mdiPencil } from '@mdi/js'

import { User } from '@/model/UserModel'

import { ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useHead } from '@unhead/vue'
import { useNotification } from '@/lib/notifications'
const { addError } = useNotification()

useHead({
  title: 'Manage Users',
})

const usersStore = useUsersStore()

const items = ref<User[]>([])
const newPassword = ref('')
const newRoles = ref<string[]>([])
const newName = ref('')

const valid = ref(false)
const editInfo = ref(false)
const addLoading = ref(false)
const deleteLoading = ref<number | boolean>(false)
const dialog = ref(false)

const form = ref<HTMLFormElement | null>(null)

const startLoading = async () => {
  try {
    items.value = await usersStore.get()
  } catch (error) {
    addError(`Could not load users (Error ${error.status}).`)
    console.log(error)
  }
}

const addUser = async () => {
  addLoading.value = true
  try {
    await usersStore.add({
      username: newName.value,
      roles: newRoles.value.map((el) => {
        return { name: el }
      }),
      password: newPassword.value,
    })
    dialog.value = false
  } catch (error) {
    addError(`Could not add user (Error ${error.status}).`)
    console.log(error)
  }

  form.value?.reset()
  addLoading.value = false
  startLoading()
}

const deleteUser = async (userId: number) => {
  deleteLoading.value = userId
  try {
    await usersStore.delete(userId)
  } catch (error) {
    addError(`Could not delete user (Error ${error.status}).`)
    console.log(error)
  }
  deleteLoading.value = false
  startLoading()
}

function isCurrentUser(username: string) {
  return false
  // TODO return this.$auth.user && username === this.$auth.user.username
}
</script>
