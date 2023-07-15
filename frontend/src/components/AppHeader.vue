<template>
  <v-app-bar app color="primary" extension-height="80px">
    <v-app-bar-nav-icon @click.stop="rootStore.toggleDrawer" />
    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>

    <template v-if="!isOnline" #extension>
      <offline-banner />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useRootStore } from '@/stores/root'
import OfflineBanner from '@/components/OfflineBanner.vue'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
const isOnline = useOnline()
const route = useRoute()
const title = computed(() => route.meta.title || 'REIMS2')

const rootStore = useRootStore()
</script>
