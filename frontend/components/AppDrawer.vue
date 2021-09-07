<template>
  <v-navigation-drawer
    v-model="drawerModel"
    mini-variant-width="72"
    :mini-variant="miniDrawer"
    app
  >
    <template #prepend>
      <v-list-item two-line>
        <v-list-item-avatar>
          <img src="https://randomuser.me/api/portraits/women/81.jpg">
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-if="$auth.loggedIn">
            Jane Doe
          </v-list-item-title>
          <v-list-item-subtitle v-if="$auth.loggedIn">
            Logged In
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-select
        v-if="!miniDrawer"
        v-model="location"
        :items="locations"
        dense
        hide-details

        class="mb-2 mx-3"
      />
    </template>

    <v-divider />

    <v-list v-if="!$vuetify.breakpoint.mobile" nav>
      <v-list-item
        v-for="item in mainItems"
        :key="item.title"
        :to="item.to"
        nuxt
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider v-if="!$vuetify.breakpoint.mobile" />
    <v-list dense nav>
      <v-list-item
        v-for="item in otherItems"
        :key="item.title"
        :to="item.to"
        nuxt
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    mainItems: {
      type: Array,
      required: true
    },
    otherItems: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
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
    },
    drawerModel: {
      get() { return !this.$vuetify.breakpoint.mobile || this.drawer },
      set(val) { this.$store.commit('setDrawer', val) }
    },
    miniDrawer: {
      get() { return !this.$vuetify.breakpoint.mobile && !this.drawer },
      set() { }
    },
    ...mapState(['drawer'])
  },
  created() {
    this.refreshGlassesInterval = setInterval(() => this.$store.dispatch('loadGlasses'), 5 * 60 * 1000)
  },
  beforeDestroy() {
    clearInterval(this.refreshGlassesInterval)
  }
}
</script>
