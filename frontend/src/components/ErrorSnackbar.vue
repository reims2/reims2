<template>
  <v-snackbar :model-value="snackbarOpen" :timeout="-1" :color="color" multi-line :attach="true">
    {{ notification?.message }}
    <template v-slot:actions>
      <v-btn variant="text" @click="removeNotification()">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useNotification } from '@/lib/notifications'

const { notification, removeNotification } = useNotification()

const snackbarOpen = computed(() => notification.value != null)
const color = computed(() => {
  if (notification.value?.type === 'error') return 'error'
  if (notification.value?.type === 'success') return 'primary'
  if (notification.value?.type === 'info') return 'primary'
  return ''
})
</script>
