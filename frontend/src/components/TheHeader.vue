<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon aria-label="Toggle menu" @click.stop="rootStore.toggleDrawer" />
    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>
    <v-chip variant="text" class="mr-1" :prepend-icon="mdiMapMarker">
      {{ rootStore.reimsSiteName }}
    </v-chip>
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
import { useRoute } from 'vue-router'
const route = useRoute()
const rootStore = useRootStore()
const { pendingCount } = usePendingChanges()
const title = computed(() => (rootStore.isDev ? 'Develop: ' : '') + (route.meta.title || 'REIMS2'))
</script>
