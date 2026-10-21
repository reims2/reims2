<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon @click.stop="rootStore.toggleDrawer" />
    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useRootStore } from '@/stores/root'
import { useRoute } from 'vue-router'
const route = useRoute()
const rootStore = useRootStore()
const title = computed(() => (rootStore.isDev ? 'Develop: ' : '') + (route.meta.title || 'REIMS2'))
</script>
