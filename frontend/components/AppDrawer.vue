<template>
  <v-navigation-drawer
    v-model="drawerModel"
    mini-variant-width="72"
    :mini-variant="miniDrawer"
    app
  >
    <template #prepend>
      <div class="mt-5 mx-3 text-h6  font-weight-medium">
        <NuxtLink
          :style="miniDrawer ? 'visibility:hidden;': ''"
          class="no-decoration no-color"
          to="/"
        >
          REIMS {{ locationNames[location] }}
        </NuxtLink>
      </div>
      <div v-if="$auth.loggedIn && $auth.user && !miniDrawer" class="text--secondary ml-3 mb-1">
        Logged in as <span class="font-weight-bold">{{ $auth.user.username }}</span>
      </div>
    </template>
    <location-dialog v-model="dialog" />

    <v-divider v-if="!miniDrawer" class="mt-3" />

    <v-list v-if="!$vuetify.breakpoint.mobile" nav>
      <v-list-item-group color="accent">
        <v-list-item
          v-for="item in mainItems"
          :key="item.title"
          :to="item.to"
          :disabled="item.disabled || false"
          nuxt
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-divider v-if="!$vuetify.breakpoint.mobile" class="mb-3" />

    <v-list nav subheader>
      <v-list-item-group color="accent">
        <v-list-item
          v-for="item in otherItems"
          :key="item.title"
          :to="item.to"
          :disabled="item.disabled || false"
          nuxt
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <template #append>
      <v-divider />
      <v-list dense nav>
        <v-list-item
          v-if="$config.isDev"
          :href="commitUrl"
          tabindex="-1"
          target=”_blank”
          rel=noopener
          class="dev-background white--text"
        >
          <v-list-item-icon>
            <v-icon color="white">
              {{ mdiBug }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>!! DEV INSTANCE !!</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click.stop="dialog=true">
          <v-list-item-icon>
            <v-icon>{{ mdiMapMarkerMultiple }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Change location</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item href="/docs" target="_blank">
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
import { mdiLogout, mdiMapMarkerMultiple, mdiBug, mdiFileDocument } from '@mdi/js'
import { locationNames } from '../lib/util'
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
      mdiBug,
      locationNames,
      mdiMapMarkerMultiple,
      mdiFileDocument,
      dialog: false
    }
  },
  computed: {
    drawerModel: {
      get() { return !this.$vuetify.breakpoint.mobile || this.drawer },
      set(val) { this.$store.commit('setDrawer', val) }
    },
    miniDrawer: {
      get() { return !this.$vuetify.breakpoint.mobile && !this.drawer },
      set() { }
    },
    commitUrl: function() {
      return 'https://github.com/reims2/reims2-frontend/commit/' + this.$config.version
    },
    ...mapState(['drawer', 'location'])
  }
}
</script>

<style scoped>
.dev-background {
  background: var(--v-accent-darken1) !important
}
</style>
