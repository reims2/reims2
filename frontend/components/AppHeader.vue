<template>
  <v-app-bar
    hide-on-scroll
    app
    dark
    color="primary"
    short
    dense
  >
    <v-btn
      icon
      class="hidden-xs-only"
      to="/"
      nuxt
    >
      <v-icon>{{ mdiArrowLeft }}</v-icon>
    </v-btn>
    <v-toolbar-title class="text-h5">
      {{ title }}
    </v-toolbar-title>

    <template v-if="items.length > 0" #extension>
      <v-tabs
        fixed-tabs
        centered
        show-arrows
      >
        <v-tab
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          nuxt
        >
          {{ item.text }}
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script>
import { mdiArrowLeft } from '@mdi/js'
export default {
  props: {
    items: {
      type: Array,
      default() { return [] }
    },
    title: {
      type: String,
      default: 'REIMS2'
    }
  },
  data() {
    return {
      mdiArrowLeft
    }
  }
}
</script>
