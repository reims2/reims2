<template>
  <div class="d-flex align-center">
    <v-progress-circular
      :style="{ visibility: rootStore.isRefreshingGlasses ? 'visible' : 'hidden' }"
      indeterminate
      size="17"
      color="white"
      class="mr-2 ma-0 pa-0"
    />
    Last update {{ lastRefreshString }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { useRootStore } from '@/stores/root'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const rootStore = useRootStore()
const lastRefresh = computed(() => rootStore.lastRefresh)
const lastRefreshString = ref<string | null>(null)

watch(
  lastRefresh,
  () => {
    generateTimeString()
  },
  { immediate: true },
)
const refreshInterval = setInterval(() => generateTimeString(), 10 * 1000)

onBeforeUnmount(() => clearInterval(refreshInterval))

function generateTimeString() {
  if (!lastRefresh.value) {
    lastRefreshString.value = ': none yet'
  } else if (dayjs().diff(lastRefresh.value) < 5 * 60 * 1000) {
    lastRefreshString.value = 'now' // don't bother the user with anything less than 5 minutes
  } else {
    lastRefreshString.value = dayjs().to(lastRefresh.value)
  }
}
</script>
