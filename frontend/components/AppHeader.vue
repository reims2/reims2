<template>
  <v-app-bar
    hide-on-scroll
    app
    dark
    color="primary"
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
    <v-toolbar-items>
      <v-tooltip bottom :open-on-hover="false" color="#000">
        <template #activator="{ on }">
          <v-btn
            v-show="$nuxt.isOffline"
            color="warning"
            text
            retain-focus-on-click
            class="mr-3"
            @click="on.click"
            @blur="on.blur"
          >
            <v-icon>{{ mdiWifiOff }}</v-icon>
            <span v-if="!$vuetify.breakpoint.mobile" class="ml-2">
              Offline
            </span>
          </v-btn>
        </template>
        <span v-if="$store.state.lastRefresh">REIMS is running offline. <last-refresh-span />.</span>
        <span v-else>No connection. Please reconnect!</span>
      </v-tooltip>
    </v-toolbar-items>
    <v-select
      v-model="location"
      :items="locations"
      dense
      hide-details
      style="max-width:150px"
      class="mr-0 mr-md-10"
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
import { mdiArrowLeft, mdiWifiOff } from '@mdi/js'
import LastRefreshSpan from './LastRefreshSpan.vue'
export default {
  components: { LastRefreshSpan },
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
      mdiWifiOff,
      refreshGlassesInterval: '',
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
        this.$nuxt.$loading.start()
        this.$store.commit('setLocation', value)
        this.$store.dispatch('loadGlasses')
      }
    }
  },
  created() {
    this.refreshGlassesInterval = setInterval(() => this.$store.dispatch('loadGlasses'), 5 * 60 * 1000)
  },
  beforeDestroy() {
    clearInterval(this.refreshGlassesInterval)
  }
}
</script>
