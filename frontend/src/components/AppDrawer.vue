<template>
  <v-navigation-drawer v-model="drawerModel" mini-variant-width="72" :rail="miniDrawer">
    <template #prepend>
      <div class="mt-5 mx-3 text-h6 font-weight-medium">
        <router-link
          :style="miniDrawer ? 'visibility:hidden;' : ''"
          class="no-decoration no-color"
          to="/"
        >
          REIMS {{ reimsSiteNames[reimsSite] }}
        </router-link>
      </div>
      <div v-if="true && !miniDrawer" class="text--secondary ml-3 mb-1">
        Logged in as
        <span class="font-weight-bold">TODO username</span>
      </div>
    </template>
    <location-dialog v-model="dialog" />

    <v-divider v-if="!miniDrawer" class="mt-3" />

    <v-list v-if="!mobile" nav color="accent">
      <v-list-item
        v-for="item in mainItems"
        :key="item.title"
        :to="item.to"
        :disabled="item.disabled || false"
        :title="item.title"
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon"></v-icon>
        </template>
      </v-list-item>
    </v-list>
    <v-divider v-if="!mobile" class="mb-3" />

    <v-list nav subheader>
      <v-list-item
        v-for="item in otherItems"
        :key="item.title"
        :to="item.to"
        :title="item.title"
        :disabled="item.disabled || false"
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon"></v-icon>
        </template>
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <v-list nav density="comfortable">
        <v-list-item
          v-if="rootStore.isDev"
          :href="commitUrl"
          tabindex="-1"
          target="”_blank”"
          rel="noopener"
          class="dev-background text-white"
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
        <v-list-item href="/docs/" target="_blank" title="Documentation">
          <template v-slot:prepend>
            <v-icon :icon="mdiFileDocument"></v-icon>
          </template>
        </v-list-item>
        <v-list-item
          @click="
            () => {
              console.log('TODO')
            }
          "
          title="Logout"
        >
          <template v-slot:prepend>
            <v-icon :icon="mdiLogout"></v-icon>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRootStore } from '@/stores/root'

import { mdiLogout, mdiMapMarkerMultiple, mdiBug, mdiFileDocument } from '@mdi/js'
import { reimsSiteNames } from '@/lib/util'
import { DrawerItem } from '@/model/ReimsModel'
import LocationDialog from '@/components/LocationDialog.vue'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

defineProps<{
  mainItems: DrawerItem[]
  otherItems: DrawerItem[]
}>()

const rootStore = useRootStore()
const reimsSite = computed(() => rootStore.reimsSite)

const dialog = ref(false)
const drawerModel = computed({
  get() {
    return !mobile || rootStore.drawer
  },
  set(val: boolean) {
    rootStore.drawer = val
  },
})
const miniDrawer = computed(() => {
  return !mobile && !rootStore.drawer
})
const commitUrl = computed(() => {
  return 'https://github.com/reims2/reims2-frontend/commit/' + rootStore.version
})
</script>

<style scoped>
.dev-background {
  background: var(--v-accent-darken1) !important;
}
.no-decoration {
  text-decoration: none !important;
}
.no-color {
  color: inherit !important;
}
</style>
