<template>
  <v-snackbar
    :value=snackbarOpen
    :timeout=-1
    color="error"
    right
    multi-line
    absolute
  >
    {{ error }}
    <template #action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="close()"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
// from https://github.com/SplusEins/SplusEins/blob/master/web/components/spluseins-error-snackbar.vue
import { useRootStore } from '@/stores/root'

export default {
  setup() {
    const rootStore = useRootStore()
    return {
      error: rootStore.error,
      clearError: rootStore.clearError
    }
  },
  data: () => ({
    snackTimeout: 0,
    snackbarOpen: false
  }),
  watch: {
    error() {
      if (this.error) {
        this.snackbarOpen = true
        // manual timeout because the timeout has to be refreshed if the message has changed
        clearTimeout(this.snackTimeout)
        this.snackTimeout = setTimeout(() => { this.close() }, 15 * 1000)
      } else {
        this.snackbarOpen = false
      }
    }
  },
  beforeUnmount() {
    clearTimeout(this.snackTimeout)
  },
  methods: {
    close() {
      this.snackbarOpen = false; this.clearError()
    }
  }
}
</script>
