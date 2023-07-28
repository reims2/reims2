<template>
  <v-overlay
    :model-value="true"
    :scrim="false"
    persistent
    no-click-animation
    scroll-strategy="none"
    class="d-flex justify-end align-end"
  >
    <v-alert
      :type="lastRefresh && !isOutdated ? 'info' : 'error'"
      prominent
      color="secondary"
      density="compact"
      max-width="300px"
      class="position"
    >
      <span v-if="lastRefresh && isOutdated">
        REIMS is running offline. Database is older than 3 days, which can lead to problems.
      </span>
      <span v-else-if="lastRefresh">
        REIMS is running offline.
        <last-refresh-span :show-spinner="false" />
      </span>
      <span v-else>No offline data stored. Please go online once to use REIMS!</span>
    </v-alert>
  </v-overlay>
</template>

<script setup lang="ts">
import { useGlassesStore } from '@/stores/glasses'
import { computed } from 'vue'
import LastRefreshSpan from '@/components/LastRefreshSpan.vue'

const glassesStore = useGlassesStore()
const isOutdated = computed(() => glassesStore.isOutdated)
const lastRefresh = computed(() => glassesStore.lastRefresh)
</script>

<style scoped>
.position {
  bottom: 60px;
  left: -20px;
}
</style>
