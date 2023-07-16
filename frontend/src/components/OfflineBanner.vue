<template>
  <v-container class="d-flex justify-center">
    <v-alert
      max-width="1000px"
      :type="lastRefresh && !isOutdated ? 'info' : 'error'"
      prominent
      color="secondary"
      dense
    >
      <span v-if="lastRefresh && isOutdated">
        REIMS is running offline. Database is older than 3 days, which can lead to problems.
      </span>
      <span v-else-if="lastRefresh">
        REIMS is running offline.
        <last-refresh-span />
        .
      </span>
      <span v-else>No offline data stored. Please go online once to use REIMS!</span>
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useGlassesStore } from '@/stores/glasses'
import { computed } from 'vue'
import LastRefreshSpan from '@/components/LastRefreshSpan.vue'

const glassesStore = useGlassesStore()
const isOutdated = computed(() => glassesStore.isOutdated)
const lastRefresh = computed(() => glassesStore.lastRefresh)
</script>
