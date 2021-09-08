<template>
  <v-app-bar
    app
    dark
    color="primary"
  >
    <v-app-bar-nav-icon @click.stop="$store.commit('toggleDrawer')" />
    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>
  </v-app-bar>
</template>

<script>
import { mdiChevronLeft, mdiMenu } from '@mdi/js'
export default {
  data: () => ({
    mdiChevronLeft,
    mdiMenu
  }),
  computed: {
    title(ctx) {
      return ctx.$root.$meta().refresh().metaInfo.titleChunk
    }
  }

}
</script>
