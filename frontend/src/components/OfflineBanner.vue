<template>
  <v-overlay
    :model-value="true"
    :scrim="false"
    persistent
    no-click-animation
    scroll-strategy="none"
    class="d-flex justify-end align-end positioned-overlay"
  >
    <v-alert
      :type="alertType"
      prominent
      density="comfortable"
      max-width="300px"
      class="mr-3 mr-md-7 mb-3 mb-md-0"
    >
      <span v-if="isOutdated">
        REIMS is running offline. Database is older than 3 days, which can lead to problems.
      </span>
      <span>
        REIMS is running offline.
        <last-refresh-span :show-spinner="false" />
      </span>
    </v-alert>
  </v-overlay>
</template>

<script setup lang="ts">
import { useGlassesStore } from '@/stores/glasses'
import LastRefreshSpan from '@/components/LastRefreshSpan.vue'

const glassesStore = useGlassesStore()
const isOutdated = computed(() => glassesStore.isOutdated)

const alertType = computed(() => {
  if (isOutdated.value) return 'warning'
  else return 'info'
})
</script>

<style>
.positioned-overlay .v-overlay__content {
  bottom: 55px;
}
</style>
