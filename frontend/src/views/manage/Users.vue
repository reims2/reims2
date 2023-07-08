<template>
  <v-container>
    <v-row dense class="d-flex justify-center">
      <v-col cols=12 md=6 lg=5>
        <v-simple-table v-if="items.length > 0">
          <thead>
            <tr>
              <th class="text-left">
                Username
              </th>
              <th class="text-left">
                Roles
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item.name"
            >
              <td :class="isCurrentUser(item.username) ? 'font-weight-bold' : ''">
                {{ item.username }}
              </td>
              <td>{{ item.roles.map(el => el.name).join(", ") }}</td>
              <td>
                <v-btn
                  v-if="!editInfo"
                  icon
                  @click="editInfo = true"
                >
                  <v-icon>{{ mdiPencil }}</v-icon>
                </v-btn>
                <v-btn
                  v-if="!isCurrentUser(item.username)"
                  icon
                  color="error"
                  :loading="deleteLoading == item.id"
                  @click="deleteUser(item.id)"
                >
                  <v-icon>{{ mdiDelete }}</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
        <v-alert
          v-else
          type="warning"
          outlined
          dense
        >
          No users loaded.
        </v-alert>

        <v-alert
          v-if="editInfo"
          type="info"
          outlined
          dense
          class="mt-4"
          dismissible
        >
          If you want to edit an existing user, you have to delete and re-add them.
        </v-alert>
        <v-dialog
          v-model="dialog"
          max-width="500px"
          persistent
        >
          <template #activator="{ props }">
            <v-btn
              color="primary"
              dark
              v-bind="props"
              class="mt-3"
            >
              Add new user
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">Add a new user</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-container>
                  <v-alert
                    v-if='newRoles.includes("ROLE_ADMIN")'
                    type="warning"
                    dense
                    prominent
                  >
                    Users with the admin role can add and delete users, so be careful to apply that role only when necessary.
                  </v-alert>
                  <v-row dense>
                    <v-col cols="12">
                      <v-text-field
                        v-model="newName"
                        label="Username"
                        :rules="[v => !!v || 'Item is required']"
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
                        :rules="[v => !!v || 'Item is required']"
                        required
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        v-model="newRoles"
                        :items='["ROLE_USER", "ROLE_ADMIN"]'
                        multiple
                        label="Roles"
                        :rules="[v => v.length > 0 || 'Item is required']"
                        required
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                @click="dialog = false"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                text
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

<script>
import { mdiDelete, mdiPlus, mdiPencil } from '@mdi/js'
import { useUsersStore } from '@/stores/users'
import { useRootStore } from '@/stores/root'
export default {
  title: 'Manage users',
  setup() {
    const usersStore = useUsersStore()
    const rootStore = useRootStore()
    return {
      getUsers: usersStore.get,
      _addUser: usersStore.add,
      _deleteUser: usersStore.delete,
      rootStore
    }
  },
  data: () => ({
    items: [],
    addLoading: false,
    deleteLoading: false,
    mdiDelete,
    mdiPlus,
    mdiPencil,
    newName: '',
    newRoles: [],
    newPassword: '',
    dialog: false,
    valid: false,
    editInfo: false
  }),
  head() {
    return {
      title: 'Manage users'
    }
  },
  computed: {

    filterString() {
      return ''
    }
  },
  mounted() {
    this.startLoading()
  },
  methods: {
    async startLoading() {
      try {
        this.items = await this.getUsers()
      } catch (error) {
        this.rootStore.setError(`Could not load users (Error ${error.status}).`)
        console.log(error)
      }
    },
    async addUser() {
      this.addLoading = true
      try {
        await this._addUser({
          username: this.newName,
          roles: this.newRoles.map((el) => { return { name: el } }),
          password: this.newPassword
        })
        this.dialog = false
      } catch (error) {
        this.rootStore.setError(`Could not add user (Error ${error.status}).`)
        console.log(error)
      }
      this.addLoading = false
      this.startLoading()
      this.$refs.form.reset()
    },
    async deleteUser(userId) {
      this.deleteLoading = userId
      try {
        await this._deleteUser(userId)
      } catch (error) {
        this.rootStore.setError(`Could not delete user (Error ${error.status}).`)
        console.log(error)
      }
      this.deleteLoading = false
      this.startLoading()
    },
    isCurrentUser(username) {
      return 'TODO'
      // return this.$auth.user && username === this.$auth.user.username
    }
  }
}
</script>
