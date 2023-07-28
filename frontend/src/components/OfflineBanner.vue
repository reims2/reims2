<template>
  <v-overlay
    :model-value="true"
    :scrim="isError"
    persistent
    no-click-animation
    scroll-strategy="none"
    class="d-flex justify-end align-end"
  >
    <v-alert
      :type="isError ? 'error' : 'info'"
      prominent
      :color="color"
      density="comfortable"
      max-width="300px"
      class="position"
    >
      <span v-if="hasGlassesLoaded && isOutdated">
        REIMS is running offline. Database is older than 3 days, which can lead to problems.
      </span>
      <span v-else-if="hasGlassesLoaded">
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
const hasGlassesLoaded = computed(() => glassesStore.hasGlassesLoaded)

const isError = computed(() => !hasGlassesLoaded.value)
const isWarning = computed(() => isError.value || isOutdated.value)
const color = computed(() => {
  if (isError.value) return 'red'
  else if (isWarning.value) return 'accent'
  else return 'secondary'
})
</script>

<style scoped>
.position {
  bottom: 60px;
  left: -20px;
}
</style>
