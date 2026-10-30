<template>
  <div
    v-if="showSpinner"
    class="d-flex align-center"
    style="cursor: pointer"
    role="button"
    tabindex="0"
    @click="glassesStore.loadGlasses()"
    @keydown.enter="glassesStore.loadGlasses()"
  >
    <v-tooltip activator="parent" location="top" aria-label="Refresh now">Refresh now</v-tooltip>
    <v-progress-circular
      v-if="glassesStore.isRefreshingGlasses"
      indeterminate
      size="17"
      color="primary"
      aria-label="Refreshing glasses"
      class="mr-2 ma-0 pa-0"
    />
    <v-icon v-else :icon="mdiRefresh" size="17" class="mr-2" />
    Last update {{ lastRefreshString }}
  </div>
  <span v-else>Last update {{ lastRefreshString }}.</span>
</template>

<script setup lang="ts">
import { mdiRefresh } from '@mdi/js'
import { useIntervalFn, useNow } from '@vueuse/core'
import { useGlassesStore } from '@/stores/glasses'
import dayjs from 'dayjs'

const { showSpinner = true } = defineProps<{ showSpinner?: boolean }>()

const glassesStore = useGlassesStore()
const now = useNow({ scheduler: (cb) => useIntervalFn(cb, 10 * 1000) })

const lastRefreshString = computed(() => {
  const lastRefresh = glassesStore.lastRefresh
  if (!lastRefresh) return ': none yet'
  // don't bother the user with anything less than a minute
  if (dayjs(now.value).diff(lastRefresh, 'minute') < 1) return 'just now'
  return dayjs(now.value).to(lastRefresh)
})
</script>
