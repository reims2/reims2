<template>
  <v-app-bar color="primary" flat>
    <router-link
      v-if="!mobile"
      to="/"
      class="text-headline-small text-white text-decoration-none ml-4 mr-6"
    >
      <reims-logo />
    </router-link>
    <location-menu v-if="authStore.isLoggedIn" />
    <v-spacer />
    <v-chip v-if="rootStore.isDev" variant="outlined" size="small" class="mr-2">DEV</v-chip>
    <v-chip
      v-if="pendingCount > 0"
      color="warning"
      variant="flat"
      class="mr-2"
      :prepend-icon="mdiCloudUploadOutline"
    >
      {{ pendingCount }} pending
    </v-chip>
    <v-btn
      icon
      :href="helpUrl(route.path)"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Documentation"
      :disabled="!isOnline"
    >
      <v-icon :icon="mdiHelpCircleOutline" />
    </v-btn>
    <account-menu v-if="authStore.isLoggedIn" />
  </v-app-bar>
</template>

<script setup lang="ts">
import { mdiCloudUploadOutline, mdiHelpCircleOutline } from '@mdi/js'
import { useRootStore } from '@/stores/root'
import { usePendingChanges } from '@/composables/pending-changes'
import { useAuthStore } from '@/stores/auth'
import { useOnline } from '@vueuse/core'
import { helpUrl } from '@/lib/help'
import { useDisplay } from 'vuetify'
import { useRoute } from 'vue-router'
import LocationMenu from '@/components/LocationMenu.vue'
import AccountMenu from '@/components/AccountMenu.vue'
import ReimsLogo from '@/components/ReimsLogo.vue'

const rootStore = useRootStore()
const authStore = useAuthStore()
const isOnline = useOnline()
const route = useRoute()
const { mobile } = useDisplay()
const { pendingCount } = usePendingChanges()
</script>
