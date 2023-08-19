<template>
  <v-overlay
    :model-value="true"
    scrim
    persistent
    scroll-strategy="none"
    class="d-flex justify-center align-center"
    contained
  >
    <v-sheet theme="light" class="pa-10" rounded>
      <div v-if="isLoading">
        <v-progress-linear indeterminate color="primary" class="mb-5" />
        <div class="text-medium-emphasis">Setting up REIMS2, please wait...</div>
      </div>
      <div v-else class="d-flex flex-column">
        <div class="pb-5">There was an error setting up REIMS2.</div>
        <v-btn color="primary" class="mb-2" @click="glassesStore.loadGlasses">Retry</v-btn>
        <v-btn variant="text" @click="authStore.logout()">Logout</v-btn>
      </div>
    </v-sheet>
  </v-overlay>
</template>

<script setup lang="ts">
import { useGlassesStore } from '@/stores/glasses'
import { useAuthStore } from '@/stores/auth'

const glassesStore = useGlassesStore()
const authStore = useAuthStore()
const isLoading = computed(() => glassesStore.isRefreshingGlasses)
</script>
