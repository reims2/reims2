<template>
  <v-container>
    <the-header />
    <v-row>
      <v-col cols="12" class="d-flex justify-center mt-8">
        <v-form
          v-model="valid"
          style="max-width: 350px"
          class="flex-grow-1"
          @submit.prevent="userLogin"
        >
          <v-text-field
            v-model="username"
            label="Username"
            :rules="[(v) => !!v || 'Item is required']"
            required
            autocorrect="off"
            autocapitalize="off"
            class="mb-1"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[(v) => !!v || 'Item is required']"
            required
            class="mb-1"
          />

          <v-select
            v-model="rootStore.reimsSite"
            :items="reimsSiteSelects"
            class="mb-3"
            label="Location"
          />

          <v-btn :disabled="!valid" color="primary" type="submit" :loading="isLoading">Login</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { ReimsAxiosError } from '@/lib/axios'
import { useToast } from 'vue-toastification'
import { reimsSiteSelects } from '@/util/util'
import { useRootStore } from '@/stores/root'

const toast = useToast()

const username = ref('')
const password = ref('')
const valid = ref(false)
const isLoading = ref(false)

const rootStore = useRootStore()
const authStore = useAuthStore()
const route = useRoute()
const redirect = computed(() => (route.query.redirect as string) ?? '/find')

if (authStore.isLoggedIn) {
  router.push(redirect.value)
}

const userLogin = async () => {
  isLoading.value = true
  try {
    await authStore.login(username.value, password.value)
    await router.push(redirect.value)
  } catch (err) {
    if (err instanceof ReimsAxiosError && err.statusCode === 401 && err.apiMessage != null) {
      toast.error(err.apiMessage)
    } else {
      toast.error(`Login failed (${err.message})`)
      console.error(err)
    }
  } finally {
    isLoading.value = false
  }
}
</script>
