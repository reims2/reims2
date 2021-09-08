<template>
  <v-container v-if="$nuxt.isOffline" class="d-flex justify-center">
    <v-alert
      max-width="1000px"
      :type="$store.state.lastRefresh ? 'warning' : 'error'"
      class="pr-6"
      rounded
      dense
    >
      <span v-if="$store.state.lastRefresh">REIMS is running offline. <last-refresh-span />.</span>
      <span v-else>No offline data stored. Please go online once to use REIMS!</span>
    </v-alert>
  </v-container>
</template>
