<template>
  <v-app-bar app color="primary" extension-height="80px">
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
const title = computed(() => (rootStore.isDev ? 'Develop: ' : '') + route.meta.title || 'REIMS2')

const rootStore = useRootStore()
</script>
