<template>
  <v-snackbar :value="snackbarOpen" :timeout="-1" color="error" right multi-line absolute>
    {{ error }}
    <template v-slot:actions>
      <v-btn variant="text" @click="close()">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useRootStore } from '@/stores/root'
import { ref, watch, computed, onBeforeUnmount } from 'vue'

const rootStore = useRootStore()
const error = computed(() => rootStore.error)

const snackTimeout = ref<any | null>(null)
const snackbarOpen = ref(false)

watch(error, (newError) => {
  if (newError) {
    snackbarOpen.value = true
    // manual timeout because the timeout has to be refreshed if the message has changed
    clearTimeout(snackTimeout.value)
    snackTimeout.value = setTimeout(() => {
      close()
    }, 15 * 1000)
  } else {
    snackbarOpen.value = false
  }
})

const close = () => {
  snackbarOpen.value = false
  rootStore.clearError()
}

onBeforeUnmount(() => {
  clearTimeout(snackTimeout.value)
})
</script>
