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
      to="/"
      nuxt
    >
      <v-icon>{{ mdiArrowLeft }}</v-icon>
    </v-btn>
    <v-toolbar-title class="text-h5 hidden-xs-only">
      {{ title }}
    </v-toolbar-title>
    <v-spacer />
    <v-select
      v-model="location"
      :items="locations"
      dense
      hide-details
      style="max-width:150px"
      class="align-self-end mr-0 mr-md-10 mb-2"
    />

    <template v-if="items.length > 0" #extension>
      <v-tabs
        fixed-tabs
        centered
        show-arrows
      >
        <v-tab
          v-for="(item, i) in items"
          :key="item.to"
          v-shortkey="['alt',(i + 1)]"
          :to="item.to"
          nuxt
          @shortkey="$router.push(item.to)"
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
      mdiArrowLeft,
      locations: [
        { text: 'San Miguel', value: 'sm' },
        { text: 'Santa Ana', value: 'sa' }
      ]
    }
  },
  computed: {
    location: {
      get() {
        return this.$store.state.location
      },
      set(value) {
        this.$store.commit('setLocation', value)
        this.$store.dispatch('glasses/loadActiveGlasses')
      }
    }
  }

}
</script>
