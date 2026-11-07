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
import { useRouter } from 'vue-router'
import { toastQueue } from '@/composables/toast'

// the browser only looks for a new version on page loads, so check when the user comes back or moves on
const router = useRouter()
useRegisterSW({
  immediate: true,
  onRegisteredSW(_swScriptUrl, registration) {
    if (!registration) return
    let lastCheck = Date.now()
    const check = () => {
      if (Date.now() - lastCheck < 60 * 1000 || !navigator.onLine) return
      lastCheck = Date.now()
      registration.update().catch(() => {})
    }
    setInterval(check, 1000 * 60 * 60)
    router.afterEach(check)
    document.addEventListener(
      'visibilitychange',
      () => document.visibilityState === 'visible' && check(),
    )
  },
})
</script>

<style>
/* the queue sits outside the layouts, so keep toasts above the bottom nav */
.v-snackbar {
  margin-bottom: 64px;
}
</style>
