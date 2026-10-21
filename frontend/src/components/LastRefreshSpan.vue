<template>
  <div v-if="showSpinner" class="d-flex align-center" @click="glassesStore.loadGlasses()">
    <v-progress-circular
      :style="{ visibility: glassesStore.isRefreshingGlasses ? 'visible' : 'hidden' }"
      indeterminate
      size="17"
      color="white"
      class="mr-2 ma-0 pa-0"
    />
    Last update {{ lastRefreshString }}
  </div>
  <span v-else>Last update {{ lastRefreshString }}.</span>
</template>

<script setup lang="ts">
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
