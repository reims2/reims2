<template>
  <RouterView />
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
useRegisterSW({
  immediate: true,
  onRegisteredSW(_swScriptUrl, registration) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    registration && setInterval(() => registration.update(), 1000 * 60 * 60)
  },
})
</script>
