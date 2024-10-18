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
import { useGlassesStore } from '@/stores/glasses'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const glassesStore = useGlassesStore()
const lastRefresh = computed(() => glassesStore.lastRefresh)
const lastRefreshString = ref<string | null>(null)

const { showSpinner = true } = defineProps<{ showSpinner?: boolean }>()

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
  } else if (dayjs().diff(lastRefresh.value, 'minute') < 1) {
    lastRefreshString.value = 'just now' // don't bother the user with anything less than X minutes
  } else {
    lastRefreshString.value = dayjs().to(lastRefresh.value)
  }
}
</script>
