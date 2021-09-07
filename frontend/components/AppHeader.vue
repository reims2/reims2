<template>
  <v-container>
    <v-app-bar
      hide-on-scroll
      app
      dark
      color="primary"
      dense
    >
      <v-app-bar-nav-icon @click.stop="$store.commit('toggleDrawer')" />
      <v-toolbar-title>
        {{ title }}
      </v-toolbar-title>
    </v-app-bar>
  </v-container>
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
