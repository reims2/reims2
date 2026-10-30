<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon aria-label="Toggle menu" @click.stop="rootStore.toggleDrawer" />
    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>
    <v-chip
      v-if="glassesStore.pendingCount > 0"
      color="warning"
      variant="flat"
      class="mr-3"
      :prepend-icon="mdiCloudUploadOutline"
      @click="glassesStore.uploadPending()"
    >
      {{ glassesStore.pendingCount }} waiting to upload
    </v-chip>
  </v-app-bar>
</template>

<script setup lang="ts">
import { mdiCloudUploadOutline } from '@mdi/js'
import { useRootStore } from '@/stores/root'
import { useGlassesStore } from '@/stores/glasses'
import { useRoute } from 'vue-router'
const route = useRoute()
const rootStore = useRootStore()
const glassesStore = useGlassesStore()
onMounted(() => glassesStore.refreshPendingCount())
const title = computed(() => (rootStore.isDev ? 'Develop: ' : '') + (route.meta.title || 'REIMS2'))
</script>
