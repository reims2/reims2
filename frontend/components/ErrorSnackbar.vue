<template>
  <v-snackbar
    :value=snackbarOpen
    :timeout=-1
    color="error"
    right
    multi-line
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
import { mapMutations, mapState } from 'vuex'

export default {
  data: () => ({
    snackTimeout: 0,
    snackbarOpen: false
  }),
  computed: {
    ...mapState({
      error: state => state.error
    })
  },
  watch: {
    error() {
      console.log('watch')
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
  beforeDestroy() {
    clearTimeout(this.snackTimeout)
  },
  methods: {
    ...mapMutations({
      clearError: 'clearError'
    }),
    close() {
      this.snackbarOpen = false; this.clearError()
    }
  }
}
</script>
