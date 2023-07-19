<template>
  <v-app>
    <app-header />
    <v-container class="ma-4">
      <h1>
        {{ pageNotFound }}
      </h1>
      <router-link to="/">Home page</router-link>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { useTitle } from '@vueuse/core'

const pageNotFound = 'Page not found'

useTitle(pageNotFound)
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
