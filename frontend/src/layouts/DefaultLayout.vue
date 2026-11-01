<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <the-footer />
  </v-app>
</template>

<script setup lang="ts">
import TheFooter from '@/components/TheFooter.vue'
</script>
