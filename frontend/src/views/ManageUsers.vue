<template>
  <page-layout title="Users">
    <v-col cols="12" md="8" lg="7">
      <page-card title="Accounts">
        <template #header>
          <v-btn color="primary" :prepend-icon="mdiAccountPlusOutline" @click="dialog = true">
            Add new user
          </v-btn>
        </template>
        <div v-if="items == null" class="pa-6">
          <v-progress-circular indeterminate color="primary" aria-label="Loading users" />
        </div>
        <div v-else-if="items.length == 0" class="pa-6">
          <v-alert type="warning" variant="tonal">No users loaded.</v-alert>
        </div>
        <v-table v-else hover>
          <thead>
            <tr>
              <th class="text-left bg-surface-muted text-medium-emphasis font-weight-bold pl-6">
                Username
              </th>
              <th class="text-left bg-surface-muted text-medium-emphasis font-weight-bold">
                Roles
              </th>
              <th class="bg-surface-muted"><span class="d-sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.username">
              <td class="pl-6" :class="isCurrentUser(item.username) ? 'font-weight-bold' : ''">
                {{ item.username }}
              </td>
              <td>{{ item.roles.map((el) => el.name).join(', ') }}</td>
              <td class="text-right text-no-wrap">
                <v-btn
                  :icon="mdiPencilOutline"
                  variant="text"
                  size="small"
                  class="text-medium-emphasis"
                  aria-label="Edit user"
                  @click="editInfo = true"
                />
                <v-btn
                  v-if="!isCurrentUser(item.username)"
                  :icon="mdiDeleteOutline"
                  variant="text"
                  size="small"
                  color="error"
                  :aria-label="`Delete ${item.username}`"
                  :loading="deleteLoading == item.id"
                  @click="deleteUser(item.id!)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-if="editInfo" class="px-6 pb-6">
          <v-alert v-model="editInfo" type="info" variant="tonal" density="compact" closable>
            If you want to edit an existing user, you have to delete and re-add them.
          </v-alert>
        </div>
      </page-card>
      <v-dialog v-model="dialog" max-width="500px" persistent>
        <v-card class="pa-2">
          <v-card-title class="text-title-large font-weight-semibold">Add new user</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-container>
                <v-alert
                  v-if="newRoles.includes('ROLE_ADMIN')"
                  type="warning"
                  variant="tonal"
                  density="comfortable"
                >
                  Users with the admin role can add and delete users, so be careful to apply that
                  role only when necessary.
                </v-alert>
                <v-row density="compact">
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
            <v-btn variant="text" class="text-medium-emphasis" @click="dialog = false">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
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
  </page-layout>
</template>
<script setup lang="ts">
import { mdiAccountPlusOutline, mdiDeleteOutline, mdiPencilOutline } from '@mdi/js'
import PageLayout from '@/components/PageLayout.vue'
import PageCard from '@/components/PageCard.vue'

import { User } from '@/model/UserModel'

import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

import { useToast } from '@/composables/toast'
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

const form = useTemplateRef('form')
startLoading()

async function startLoading() {
  try {
    items.value = await usersStore.get()
  } catch (error) {
    toast.error(`Could not load users (${(error as Error).message}).`)
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
    toast.error(`Could not add user (${(error as Error).message}).`)
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
    toast.error(`Could not delete user (${(error as Error).message}).`)
  }
  await startLoading()
  deleteLoading.value = false
}

function isCurrentUser(username: string) {
  return username === authStore.user
}
</script>
