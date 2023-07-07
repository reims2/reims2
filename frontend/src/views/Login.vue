<template>
  <v-container>
    <app-header title="Login" />
    <v-row dense class="justify-center">
      <v-col cols=12 md=6 lg=4>
        <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="userLogin"
        >
          <v-row>
            <v-col cols=12>
              <v-alert v-if="errorText" type="error" dense outlined>
                {{ errorText }}
              </v-alert>
              <v-text-field
                v-model="username"
                label="Username"
                :rules="[v => !!v || 'Item is required']"
                required
                autocorrect="off"
                autocapitalize="off"
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                :rules="[v => !!v || 'Item is required']"
                required
              />
              <v-btn
                :disabled="!valid"
                color="primary"
                type="submit"
              >
                Login
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: 'start',
  data() {
    return {
      username: '',
      password: '',
      valid: false,
      errorText: ''
    }
  },
  methods: {
    async userLogin() {
      this.errorText = ''
      try {
        // TODO
        // await this.$auth.loginWith('local', { data: { username: this.username, password: this.password } })
      } catch (err) {
        console.log(err)
        if (err.status === 401) {
          this.errorText = err.message
        } else {
          this.errorText = `Login failed (Error ${err.status})`
        }
      }
    }
  }
}
</script>
