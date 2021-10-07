<template>
  <v-navigation-drawer
    v-model="drawerModel"
    mini-variant-width="72"
    :mini-variant="miniDrawer"
    app
  >
    <template #prepend>
      <h2 class="text-h4 mt-4 mx-3" :style="miniDrawer ? 'visibility:hidden;': ''">
        REIMS2
      </h2>
      <div v-if="$auth.loggedIn && $auth.user" class="text--secondary mx-3 mb-2" :style="miniDrawer ? 'visibility:hidden;': ''">
        Logged in as <span class="font-weight-bold">{{ $auth.user.username }}</span>
      </div>
      <v-select
        v-if="!miniDrawer"
        v-model="location"
        :items="locations"
        dense
        hide-details
        class="mb-1 mx-3"
      />
      <div v-if="!miniDrawer" class="text-caption mb-1 mx-3">
        <div>{{ $store.state.allGlasses.length }} glasses loaded</div>
      </div>
    </template>

    <v-list v-if="!$vuetify.breakpoint.mobile" nav>
      <v-list-item
        v-for="item in mainItems"
        :key="item.title"
        :to="item.to"
        nuxt
        active-class="highlighted"
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

    <v-list dense nav subheader>
      <v-subheader v-if="!miniDrawer">
        Inventory management
      </v-subheader>
      <v-list-item
        v-for="item in otherItems"
        :key="item.title"
        :to="item.to"
        nuxt
        active-class="highlighted"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <v-list dense nav>
        <v-list-item href="/docs">
          <v-list-item-icon>
            <v-icon>{{ mdiFileDocument }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Documentation</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="$auth.logout()">
          <v-list-item-icon>
            <v-icon>{{ mdiLogout }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex'
import { mdiLogout, mdiFileDocument } from '@mdi/js'
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
      mdiLogout,
      mdiFileDocument,
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
    this.$store.dispatch('loadGlasses')
    this.refreshGlassesInterval = setInterval(() => this.$store.dispatch('loadGlasses'), 5 * 60 * 1000)
  },
  beforeDestroy() {
    clearInterval(this.refreshGlassesInterval)
  }
}
</script>

<style scoped>
.highlighted {
  color: var(--v-primary-base) !important
}
</style>
