<template>
  <v-row no-gutters class="h-100">
    <v-col cols="12" md="7">
      <v-img
        :src="heroImage"
        cover
        position="left"
        gradient="135deg, rgba(0, 46, 51, 0.95), rgba(0, 92, 102, 0.85)"
        class="h-100 text-white"
      >
        <div class="d-flex align-center h-100 pa-6 pa-sm-10 pa-lg-16">
          <v-sheet color="transparent" max-width="640">
            <p class="text-label-large text-uppercase opacity-80 mb-2">
              Partners for Visual Health
            </p>
            <h1 class="text-display-medium text-lg-display-large font-weight-bold mb-4">REIMS2</h1>
            <p class="text-body-large text-md-title-large opacity-90 mb-6">
              The Richmond Eyeglass Inventory Matching System. It matches donated glasses to patient
              prescriptions at the annual eyeglass campaigns in El Salvador.
            </p>
            <v-list bg-color="transparent" lines="two" class="d-none d-sm-block pa-0">
              <v-list-item
                :prepend-icon="mdiMagnify"
                title="Match prescriptions"
                subtitle="Ranks every pair in stock against a prescription, scored like the original REIMS."
                class="px-0"
              />
              <v-list-item
                :prepend-icon="mdiWifiOff"
                title="Works offline"
                subtitle="Search, dispense and edit without internet. Changes upload once you are back online."
                class="px-0"
              />
            </v-list>
          </v-sheet>
        </div>
      </v-img>
    </v-col>

    <v-col cols="12" md="5" class="d-flex align-center justify-center pa-6 pa-sm-10">
      <v-sheet width="100%" max-width="380">
        <v-form v-model="valid" @submit.prevent="userLogin">
          <template v-if="!authStore.isLoggedIn">
            <h2 class="text-headline-small mb-6">Sign in</h2>
            <v-text-field
              v-model="username"
              label="Username"
              :rules="[(v) => !!v || 'Item is required']"
              :prepend-inner-icon="mdiAccount"
              required
              autocomplete="username"
              autocorrect="off"
              autocapitalize="off"
              class="mb-1"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              :rules="[(v) => !!v || 'Item is required']"
              :prepend-inner-icon="mdiLock"
              required
              autocomplete="current-password"
              class="mb-1"
            />
          </template>
          <v-select
            v-model="rootStore.reimsSite"
            :items="reimsSiteSelects"
            label="Location"
            :prepend-inner-icon="mdiMapMarker"
            class="mb-2"
          />
          <v-btn v-if="authStore.isLoggedIn" color="primary" size="large" block to="/find">
            Open REIMS2
          </v-btn>
          <v-btn
            v-else
            :disabled="!valid"
            color="primary"
            size="large"
            block
            type="submit"
            :loading="isLoading"
          >
            Login
          </v-btn>
        </v-form>

        <v-btn
          class="mt-6"
          href="/docs/"
          target="_blank"
          rel="noopener noreferrer"
          variant="tonal"
          block
          :prepend-icon="mdiFileDocument"
        >
          View Manual
        </v-btn>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { mdiAccount, mdiFileDocument, mdiLock, mdiMapMarker, mdiMagnify, mdiWifiOff } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { ReimsAxiosError } from '@/lib/axios'
import { useToast } from '@/composables/toast'
import { reimsSiteSelects } from '@/util/util'
import { useRootStore } from '@/stores/root'
import heroImage from '@/assets/img/pfvh-hero.jpg'

const toast = useToast()

const username = ref('')
const password = ref('')
const valid = ref(false)
const isLoading = ref(false)

const rootStore = useRootStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const redirect = computed(() => (route.query.redirect as string) ?? '/find')

const userLogin = async () => {
  isLoading.value = true
  try {
    await authStore.login(username.value, password.value)
    await router.push(redirect.value)
  } catch (err) {
    if (err instanceof ReimsAxiosError && err.statusCode === 401 && err.apiMessage != null) {
      toast.error(err.apiMessage)
    } else {
      toast.error(`Login failed (${(err as Error).message})`)
      console.error(err)
    }
  } finally {
    isLoading.value = false
  }
}
</script>
