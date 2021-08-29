<template>
  <v-snackbar
    v-if="$vuetify.isOffline"
    :value="snackbarOpen"
    timeout=-1
    :color="$store.state.lastRefresh ? 'warning' : 'error'"
    right
  >
    <span v-if="$store.state.lastRefresh">REIMS is running offline. <last-refresh-span />.</span>
    <span v-else>No offline data stored. Please go online once to use REIMS!</span>
  </v-snackbar>
</template>

<script>
export default {
  data: () => ({
    snackbarOpen: true
  })
}
</script>
