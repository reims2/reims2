<template>
  <RouterView />
  <v-snackbar-queue
    v-model="toastQueue"
    location="bottom"
    total-visible="5"
    display-strategy="overflow"
    closable
  />
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { toastQueue } from '@/composables/toast'
useRegisterSW({
  immediate: true,
  onRegisteredSW(_swScriptUrl, registration) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    registration && setInterval(() => registration.update(), 1000 * 60 * 60)
  },
})
</script>

<style>
/* the queue sits outside the layouts, so keep toasts above the footer and bottom nav */
.v-snackbar {
  margin-bottom: 64px;
}
</style>
