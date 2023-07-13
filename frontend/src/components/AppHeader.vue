<template>
  <v-app-bar app dark color="primary" extension-height="80px">
    <v-app-bar-nav-icon @click.stop="rootStore.toggleDrawer" />
    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>

    <template v-if="rootStore.isOffline" #extension>
      <offline-banner />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRootStore } from '@/stores/root'
import OfflineBanner from '@/components/OfflineBanner.vue'

const rootStore = useRootStore()
const title = ref('REIMS2')
// TODO
//   $route(to) {
//     this.title = to.meta.title || 'REIMS2'
//   }
// created() {
//   this.title = this.$route.meta.title || 'REIMS2'
// }
</script>
