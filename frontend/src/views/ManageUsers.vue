<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols="12" md="6" lg="5">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Username</th>
              <th class="text-left">Roles</th>
              <th></th>
            </tr>
          </thead>
          <v-progress-circular v-if="items == null" indeterminate />
          <v-alert v-else-if="items.length == 0" type="warning">No users loaded.</v-alert>
          <tbody v-else>
            <tr v-for="item in items" :key="item.username">
              <td :class="isCurrentUser(item.username) ? 'font-weight-bold' : ''">
                {{ item.username }}
              </td>
              <td>{{ item.roles.map((el) => el.name).join(', ') }}</td>
              <td class="d-flex align-center">
                <v-btn icon size="x-small" @click="editInfo = true">
                  <v-icon>{{ mdiPencil }}</v-icon>
                </v-btn>
                <v-btn
                  v-if="!isCurrentUser(item.username)"
                  icon
                  size="x-small"
                  color="error"
                  class="ml-2"
                  :loading="deleteLoading == item.id"
                  @click="deleteUser(item.id!)"
                >
                  <v-icon>{{ mdiDelete }}</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-alert
          v-if="editInfo"
          type="info"
          color="primary"
          variant="outlined"
          density="compact"
          class="mt-4"
          dismissible
        >
          If you want to edit an existing user, you have to delete and re-add them.
        </v-alert>
        <v-dialog v-model="dialog" max-width="500px" persistent>
          <template #activator="{ props }">
            <v-btn color="primary" v-bind="props" class="mt-3">Add new user</v-btn>
          </template>
          <v-card>
            <v-toolbar color="primary" title="Add new user"></v-toolbar>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-container>
                  <v-alert
                    v-if="newRoles.includes('ROLE_ADMIN')"
                    type="warning"
                    prominent
                    density="comfortable"
                  >
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
import { useAuthStore } from '@/stores/auth'

import { useToast } from 'vue-toastification'
const toast = useToast()

const usersStore = useUsersStore()
const authStore = useAuthStore()

const items = ref<User[] | null>(null)
const newPassword = ref('')
const newRoles = ref<string[]>([])
const newName = ref('')

const valid = ref(false)
const editInfo = ref(false)
const addLoading = ref(false)
const deleteLoading = ref<number | boolean>(false)
const dialog = ref(false)

const form = ref<HTMLFormElement | null>(null)
startLoading()

async function startLoading() {
  try {
    items.value = await usersStore.get()
  } catch (error) {
    toast.error(`Could not load users (${error.message}).`)
  }
}

const addUser = async () => {
  if (addLoading.value) return
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
    toast.error(`Could not add user (${error.message}).`)
  }

  form.value?.reset()
  await startLoading()
  addLoading.value = false
}

const deleteUser = async (userId: number) => {
  if (deleteLoading.value) return
  deleteLoading.value = userId
  try {
    await usersStore.deleteUser(userId)
  } catch (error) {
    toast.error(`Could not delete user (${error.message}).`)
  }
  await startLoading()
  deleteLoading.value = false
}

function isCurrentUser(username: string) {
  return username === authStore.user
}
</script>
