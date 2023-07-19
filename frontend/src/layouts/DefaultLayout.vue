<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <app-footer :show-last-update="false" />
  </v-app>
</template>

<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
</script>
