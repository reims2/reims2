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
      :type="isOutdated ? 'warning' : 'info'"
      :icon="mdiCloudOffOutline"
      elevation="3"
      max-width="340px"
      title="You are offline"
      class="mr-3 mr-md-7 mb-3 mb-md-0 text-body-medium"
    >
      <div>Search, dispense and edit still work. Changes upload when you are back.</div>
      <div v-if="isOutdated">The data is older than 3 days, which can lead to problems.</div>
      <div><last-refresh-span :show-spinner="false" /></div>
    </v-alert>
  </v-overlay>
</template>

<script setup lang="ts">
import { mdiCloudOffOutline } from '@mdi/js'
import { useGlassesStore } from '@/stores/glasses'
import LastRefreshSpan from '@/components/LastRefreshSpan.vue'

const glassesStore = useGlassesStore()
const isOutdated = computed(() => glassesStore.isOutdated)
</script>

<style>
.positioned-overlay .v-overlay__content {
  bottom: 55px;
}
</style>
