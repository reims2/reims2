<template>
  <v-navigation-drawer v-model="drawerModel" mini-variant-width="72" :mini-variant="miniDrawer" app>
    <template #prepend>
      <div class="mt-5 mx-3 text-h6 font-weight-medium">
        <router-link
          :style="miniDrawer ? 'visibility:hidden;' : ''"
          class="no-decoration no-color"
          to="/"
        >
          REIMS {{ locationNames[location] }}
        </router-link>
      </div>
      <div v-if="true && !miniDrawer" class="text--secondary ml-3 mb-1">
        Logged in as <span class="font-weight-bold"> TODO username </span>
      </div>
    </template>
    <location-dialog v-model="dialog" />

    <v-divider v-if="!miniDrawer" class="mt-3" />

    <v-list v-if="!rootStore.isMobile" nav color="accent">
      <v-list-item
        v-for="item in mainItems"
        :key="item.title"
        :to="item.to"
        :disabled="item.disabled || false"
        :title="item.title"
        :icon="item.icon"
      >
      </v-list-item>
    </v-list>
    <v-divider v-if="!rootStore.isMobile" class="mb-3" />

    <v-list nav subheader>
      <v-list-item
        v-for="item in otherItems"
        :key="item.title"
        :to="item.to"
        :title="item.title"
        :icon="item.icon"
        :disabled="item.disabled || false"
      >
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <v-list dense nav>
        <v-list-item
          v-if="rootStore.isDev"
          :href="commitUrl"
          tabindex="-1"
          target="”_blank”"
          rel="noopener"
          class="dev-background white--text"
          title="!! DEV INSTANCE !!"
        >
          <template v-slot:prepend>
            <v-icon :icon="mdiBug"></v-icon>
          </template>
        </v-list-item>
        <v-list-item @click.stop="dialog = true" title="Change location">
          <template v-slot:prepend>
            <v-icon :icon="mdiMapMarkerMultiple"></v-icon>
          </template>
        </v-list-item>
        <v-list-item href="/docs/" target="_blank" title="Documentation" :icon="mdiFileDocument">
        </v-list-item>
        <v-list-item
          @click="
            () => {
              console.log('TODO')
            }
          "
          :icon="mdiLogout"
          title="Logout"
        >
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { useRootStore } from '@/stores/root'
import { mapState } from 'pinia'

import { mdiLogout, mdiMapMarkerMultiple, mdiBug, mdiFileDocument } from '@mdi/js'
import { locationNames } from '../lib/util'
import LocationDialog from './LocationDialog.vue'

export default {
  setup() {
    const rootStore = useRootStore()
    return { rootStore }
  },
  components: {
    LocationDialog,
  },
  props: {
    mainItems: {
      type: Array,
      required: true,
    },
    otherItems: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      mdiLogout,
      mdiBug,
      locationNames,
      mdiMapMarkerMultiple,
      mdiFileDocument,
      dialog: false,
    }
  },
  computed: {
    drawerModel: {
      get() {
        return !this.rootStore.isMobile || this.drawer
      },
      set(val) {
        this.rootStore.drawer = val
      },
    },
    miniDrawer: {
      get() {
        return !this.rootStore.isMobile && !this.drawer
      },
      set() {},
    },
    commitUrl: function () {
      return 'https://github.com/reims2/reims2-frontend/commit/' + this.rootStore.version
    },
    ...mapState(useRootStore, ['drawer', 'location']),
  },
}
</script>

<style scoped>
.dev-background {
  background: var(--v-accent-darken1) !important;
}
</style>
