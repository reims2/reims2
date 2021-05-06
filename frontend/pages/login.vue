<template>
  <v-container fluid>
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
              <v-text-field
                v-model="username"
                label="Username"
                :rules="[v => !!v || 'Item is required']"
                required
              />
              <v-text-field
                v-model="password"
                label="Password"
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
  data() {
    return {
      username: '',
      password: '',
      valid: false
    }
  },
  methods: {
    async userLogin() {
      try {
        const response = await this.$auth.loginWith('local', { data: { username: this.username, password: this.password } })
        console.log(response)
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>
