<template>
  <v-container class="d-flex justify-center">
    <v-alert
      max-width="1000px"
      :type="$store.state.lastRefresh && !$store.state.isOutdated ? 'info' : 'error'"
      prominent
      color="secondary"
      dense
    >
      <span v-if="$store.state.lastRefresh && $store.state.isOutdated">REIMS is running offline. Database is older than 3 days, which can lead to problems.</span>
      <span v-else-if="$store.state.lastRefresh">REIMS is running offline. <last-refresh-span />.</span>
      <span v-else>No offline data stored. Please go online once to use REIMS!</span>
    </v-alert>
  </v-container>
</template>
