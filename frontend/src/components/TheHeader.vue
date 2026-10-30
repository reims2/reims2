<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon aria-label="Toggle menu" @click.stop="rootStore.toggleDrawer" />
    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>
    <v-chip
      v-if="authStore.isLoggedIn"
      variant="text"
      class="mr-1"
      :prepend-icon="mdiMapMarker"
      :disabled="!isOnline"
      :aria-label="`Change location (${rootStore.reimsSiteName})`"
      @click="isLocationDialogOpen = true"
    >
      {{ rootStore.reimsSiteName }}
    </v-chip>
    <location-dialog v-model="isLocationDialogOpen" />
    <v-chip
      v-if="pendingCount > 0"
      color="warning"
      variant="flat"
      class="mr-3"
      :prepend-icon="mdiCloudUploadOutline"
    >
      {{ pendingCount }} waiting to upload
    </v-chip>
  </v-app-bar>
</template>

<script setup lang="ts">
import { mdiCloudUploadOutline, mdiMapMarker } from '@mdi/js'
import { useRootStore } from '@/stores/root'
import { usePendingChanges } from '@/composables/pending-changes'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import LocationDialog from '@/components/LocationDialog.vue'
const route = useRoute()
const rootStore = useRootStore()
const authStore = useAuthStore()
const isOnline = useOnline()
const { pendingCount } = usePendingChanges()
const isLocationDialogOpen = ref(false)
const title = computed(() => (rootStore.isDev ? 'Develop: ' : '') + (route.meta.title || 'REIMS2'))
</script>
