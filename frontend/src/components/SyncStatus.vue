<template>
  <v-btn
    stacked
    variant="text"
    class="text-body-small font-weight-semibold"
    :height="56"
    :width="96"
    :color="status.color"
    :prepend-icon="status.icon"
    :aria-label="`Sync status: ${status.label}`"
    @click="refresh"
  >
    {{ status.label }}
    <v-tooltip activator="parent" location="end" aria-label="Sync details">
      <div v-if="pendingCount > 0">{{ pendingCount }} changes waiting to upload.</div>
      <div v-if="glassesStore.isOutdated">The data is older than 3 days.</div>
      <last-refresh-span :show-spinner="false" />
      <div v-if="isOnline">Click to refresh now.</div>
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import {
  mdiCloudAlertOutline,
  mdiCloudCheckOutline,
  mdiCloudOffOutline,
  mdiCloudUploadOutline,
} from '@mdi/js'
import { useOnline } from '@vueuse/core'
import { useGlassesStore } from '@/stores/glasses'
import { usePendingChanges } from '@/composables/pending-changes'
import LastRefreshSpan from '@/components/LastRefreshSpan.vue'
import { useToast } from '@/composables/toast'

const glassesStore = useGlassesStore()
const isOnline = useOnline()
const toast = useToast()
const { pendingCount } = usePendingChanges()

function refresh() {
  if (!isOnline.value) return
  glassesStore
    .loadGlasses()
    .catch((error) => toast.warning(`Could not refresh glasses (${(error as Error).message})`))
}

const status = computed(() => {
  if (pendingCount.value > 0)
    return {
      icon: mdiCloudUploadOutline,
      label: `${pendingCount.value} waiting`,
      color: 'rail-warn',
    }
  if (glassesStore.isOutdated)
    return { icon: mdiCloudAlertOutline, label: 'Outdated', color: 'rail-warn' }
  if (!isOnline.value) return { icon: mdiCloudOffOutline, label: 'Offline', color: 'on-rail' }
  return { icon: mdiCloudCheckOutline, label: 'Synced', color: 'rail-ok' }
})
</script>
