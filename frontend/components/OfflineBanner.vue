<template>
  <v-container class="d-flex justify-center">
    <v-alert
      max-width="1000px"
      :type="$store.state.lastRefresh ? 'info' : 'error'"
      prominent
      dense
    >
      <span v-if="$store.state.lastRefresh">REIMS is running offline. <last-refresh-span />.</span>
      <span v-else>No offline data stored. Please go online once to use REIMS!</span>
    </v-alert>
  </v-container>
</template>
