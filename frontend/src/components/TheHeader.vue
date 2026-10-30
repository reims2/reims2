<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon
      v-if="authStore.isLoggedIn && !mobile"
      aria-label="Toggle menu"
      @click.stop="rootStore.toggleDrawer"
    />
    <router-link v-if="!mobile" to="/" class="brand ml-4 mr-6">REIMS2</router-link>
    <v-btn
      v-if="authStore.isLoggedIn"
      variant="tonal"
      class="ml-2 ml-sm-0 text-none"
      :prepend-icon="mdiMapMarker"
      :append-icon="mdiMenuDown"
      :disabled="!isOnline"
      :aria-label="`Change location (${rootStore.reimsSiteName})`"
      @click="isLocationDialogOpen = true"
    >
      {{ rootStore.reimsSiteName }}
    </v-btn>
    <location-dialog v-model="isLocationDialogOpen" />
    <v-toolbar-title v-if="!mobile" class="ml-6">{{ title }}</v-toolbar-title>
    <v-spacer v-else />
    <v-chip v-if="rootStore.isDev" variant="outlined" size="small" class="mr-2">DEV</v-chip>
    <v-chip
      v-if="pendingCount > 0"
      color="warning"
      variant="flat"
      class="mr-2"
      :prepend-icon="mdiCloudUploadOutline"
    >
      {{ pendingCount }} {{ mobile ? 'pending' : 'waiting to upload' }}
    </v-chip>
    <v-menu v-if="authStore.isLoggedIn" location="bottom end">
      <template #activator="{ props }">
        <v-btn v-bind="props" :icon="mdiAccountCircle" aria-label="Account" class="mr-1" />
      </template>
      <v-list density="comfortable" min-width="220">
        <v-list-item :subtitle="`Logged in as ${authStore.user}`" />
        <v-divider class="my-1" />
        <v-list-item
          title="Documentation"
          href="/docs/"
          target="_blank"
          rel="noopener noreferrer"
          :prepend-icon="mdiFileDocument"
          :disabled="!isOnline"
        />
        <v-list-item
          title="About REIMS2"
          :prepend-icon="mdiInformation"
          @click="isAboutDialogOpen = true"
        />
        <v-list-item title="Logout" :prepend-icon="mdiLogout" @click="authStore.logout()" />
      </v-list>
    </v-menu>
    <about-dialog v-model="isAboutDialogOpen" />
  </v-app-bar>
</template>

<script setup lang="ts">
import {
  mdiAccountCircle,
  mdiCloudUploadOutline,
  mdiFileDocument,
  mdiInformation,
  mdiLogout,
  mdiMapMarker,
  mdiMenuDown,
} from '@mdi/js'
import { useRootStore } from '@/stores/root'
import { usePendingChanges } from '@/composables/pending-changes'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import LocationDialog from '@/components/LocationDialog.vue'
import AboutDialog from '@/components/AboutDialog.vue'
const route = useRoute()
const rootStore = useRootStore()
const authStore = useAuthStore()
const isOnline = useOnline()
const { mobile } = useDisplay()
const { pendingCount } = usePendingChanges()
const isLocationDialogOpen = ref(false)
const isAboutDialogOpen = ref(false)
const title = computed(() => route.meta.title || '')
</script>

<style scoped>
.brand {
  color: inherit;
  text-decoration: none;
  font-size: 1.375rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
