<template>
  <v-container>
    <app-header />
    <v-row dense class="justify-center">
      <v-col cols="12" md="6" lg="4">
        <v-form ref="form" v-model="valid" @submit.prevent="userLogin">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="username"
                label="Username"
                :rules="[(v) => !!v || 'Item is required']"
                required
                autocorrect="off"
                autocapitalize="off"
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                :rules="[(v) => !!v || 'Item is required']"
                required
              />
              <v-btn :disabled="!valid" color="primary" type="submit">Login</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import AppHeader from '@/components/AppHeader.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { ReimsAxiosError } from '@/lib/axios'
import { useToast } from 'vue-toastification'
const toast = useToast()

const username = ref('')
const password = ref('')
const valid = ref(false)
const errorText = ref('')

const authStore = useAuthStore()
const route = useRoute()
const redirect = computed(() => (route.query.redirect as string) ?? '/find')

if (authStore.isLoggedIn) {
  router.push(redirect.value)
}

const userLogin = async () => {
  errorText.value = ''
  try {
    await authStore.login(username.value, password.value)
    router.push(redirect.value)
  } catch (err) {
    if (err instanceof ReimsAxiosError && err.statusCode === 401 && err.apiMessage != null) {
      toast.error(err.apiMessage)
    } else {
      toast.error('Login failed (${err.message)')
      console.error(err)
    }
  }
}
</script>
