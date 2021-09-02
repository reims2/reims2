<template>
  <v-snackbar
    :value="$nuxt.isOffline"
    timeout=-1
    :color="$store.state.lastRefresh ? 'warning' : 'error'"
    right
  >
    <span v-if="$store.state.lastRefresh">REIMS is running offline. <last-refresh-span />.</span>
    <span v-else>No offline data stored. Please go online once to use REIMS!</span>
  </v-snackbar>
</template>
