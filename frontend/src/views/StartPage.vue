<template>
  <v-row no-gutters class="h-100">
    <v-col cols="12" md="7">
      <v-img
        :src="heroImage"
        cover
        position="30% center"
        gradient="rgba(0, 47, 53, 0.86), rgba(0, 47, 53, 0.86)"
        class="h-100 text-white"
      >
        <div class="d-flex flex-column justify-space-between ga-12 h-100 pa-6 pa-sm-10 pa-lg-16">
          <reims-logo class="hero-logo" />
          <div class="hero-text">
            <p class="text-label-large text-uppercase hero-eyebrow mb-5">
              Partners for Visual Health
            </p>
            <h1 class="text-display-small text-lg-display-medium font-weight-bold mb-5">
              Donated glasses, matched to each prescription
            </h1>
            <p class="hero-lead ma-0">
              The Richmond Eyeglass Inventory Matching System, used at the annual eyeglass campaigns
              in El Salvador.
            </p>
          </div>
          <div class="hero-text d-none d-sm-flex ga-6">
            <div
              v-for="point in points"
              :key="point.title"
              class="d-flex align-start ga-4 flex-1-1-0"
            >
              <div class="hero-tile d-flex align-center justify-center flex-shrink-0">
                <v-icon :icon="point.icon" />
              </div>
              <div>
                <p class="text-body-large font-weight-semibold mb-1">{{ point.title }}</p>
                <p class="text-body-medium hero-muted ma-0">{{ point.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </v-img>
    </v-col>

    <v-col
      cols="12"
      md="5"
      class="d-flex flex-column align-center justify-center ga-4 py-12 px-6 px-sm-8"
    >
      <v-card border elevation="1" width="100%" max-width="400" class="pa-6 pa-sm-8">
        <v-form v-model="valid" @submit.prevent="userLogin">
          <template v-if="!authStore.isLoggedIn">
            <h2 class="text-headline-medium font-weight-bold mb-1">Sign in</h2>
            <p class="text-body-medium text-medium-emphasis mb-7">
              Then pick the site you are working at today.
            </p>
            <v-text-field
              v-model="username"
              label="Username"
              :rules="[(v) => !!v || 'Enter your username']"
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
              :rules="[(v) => !!v || 'Enter your password']"
              :prepend-inner-icon="mdiLock"
              required
              autocomplete="current-password"
              class="mb-1"
            />
          </template>
          <template v-else>
            <h2 class="text-headline-medium font-weight-bold mb-1">Welcome back</h2>
            <p class="text-body-medium text-medium-emphasis mb-7">
              Check the site, then open REIMS2. Signed in as
              <strong class="text-high-emphasis font-weight-semibold">{{ authStore.user }}</strong>
            </p>
          </template>
          <v-select
            v-model="rootStore.reimsSite"
            :items="reimsSiteSelects"
            label="Location"
            :prepend-inner-icon="mdiMapMarker"
            class="mb-3"
          />
          <v-btn
            v-if="authStore.isLoggedIn"
            color="primary"
            size="large"
            elevation="2"
            block
            to="/find"
            :append-icon="mdiArrowRight"
          >
            Open REIMS2
          </v-btn>
          <v-btn
            v-else
            :disabled="!valid"
            color="primary"
            size="large"
            elevation="2"
            block
            type="submit"
            :loading="isLoading"
          >
            Sign in
          </v-btn>
        </v-form>
      </v-card>

      <v-btn
        href="/docs/"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
        color="primary"
        :prepend-icon="mdiBookOpenVariant"
      >
        Read the manual
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {
  mdiAccount,
  mdiArrowRight,
  mdiBookOpenVariant,
  mdiLock,
  mdiMagnify,
  mdiMapMarker,
  mdiWifiOff,
} from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { ReimsAxiosError } from '@/lib/axios'
import { useToast } from '@/composables/toast'
import { reimsSiteSelects } from '@/util/util'
import { useRootStore } from '@/stores/root'
import heroImage from '@/assets/img/pfvh-hero.jpg'
import ReimsLogo from '@/components/ReimsLogo.vue'

const points = [
  {
    icon: mdiMagnify,
    title: 'Match prescriptions',
    text: 'Ranks every pair in stock, scored like the original REIMS.',
  },
  {
    icon: mdiWifiOff,
    title: 'Works offline',
    text: 'Search, dispense and edit without internet. Changes upload once you are back online.',
  },
]

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

<style scoped>
.hero-logo {
  font-size: 30px;
}
.hero-text {
  max-width: 640px;
}
.hero-eyebrow {
  color: #8fd6dd;
  letter-spacing: 0.08em;
}
.hero-lead {
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: #d3e9ec;
}
.hero-muted {
  color: #a6d2d8;
}
.hero-tile {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
}
</style>
