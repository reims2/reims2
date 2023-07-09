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

<script>
import { mdiChevronLeft, mdiMenu } from '@mdi/js'
import { useRootStore } from '@/stores/root'
import OfflineBanner from '@/components/OfflineBanner.vue'

export default {
  components: {
    OfflineBanner,
  },
  setup() {
    const rootStore = useRootStore()
    return { rootStore }
  },
  data: () => ({
    mdiChevronLeft,
    mdiMenu,
    title: 'REIMS2',
  }),
  watch: {
    $route(to) {
      this.title = to.meta.title || 'REIMS2'
    },
  },
  created() {
    this.title = this.$route.meta.title || 'REIMS2'
  },
}
</script>
