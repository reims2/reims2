<template>
  <v-navigation-drawer
    :rail="isMiniDrawer"
    :model-value="isDrawerOpen"
    @update:model-value="(val) => (rootStore.drawer = val)"
  >
    <template #prepend>
      <div class="mt-5 mx-3 text-h6 font-weight-medium">
        <router-link
          :style="isMiniDrawer ? 'visibility:hidden;' : ''"
          class="no-decoration no-color"
          to="/"
        >
          REIMS {{ reimsSiteName }}
        </router-link>
      </div>
      <div v-if="true && !isMiniDrawer" class="text-medium-emphasis ml-3 mb-1">
        Logged in as
        <span class="font-weight-bold">{{ authStore.user }}</span>
      </div>
    </template>
    <location-dialog v-model="dialog" />

    <v-divider v-if="!isMiniDrawer" class="mt-3" />

    <v-list v-if="!mobile" nav color="accent" class="bigger-text">
      <v-list-item
        v-for="item in mainItems"
        :key="item.title"
        :to="item.to"
        :disabled="item.disabled || false"
        :title="item.title"
      >
        <template #prepend>
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
        <template #prepend>
          <v-icon :icon="item.icon"></v-icon>
        </template>
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <v-list nav>
        <v-list-item
          v-if="rootStore.isDev"
          :href="commitUrl"
          tabindex="-1"
          target="”_blank”"
          rel="noopener"
          class="dev-background text-white"
          title="!! DEV INSTANCE !!"
        >
          <template #prepend>
            <v-icon :icon="mdiBug"></v-icon>
          </template>
        </v-list-item>
        <v-list-item title="Change location" :disabled="!isOnline" @click.stop="dialog = true">
          <template #prepend>
            <v-icon :icon="mdiMapMarkerMultiple"></v-icon>
          </template>
        </v-list-item>
        <v-list-item href="/docs/" target="_blank" title="Documentation">
          <template #prepend>
            <v-icon :icon="mdiFileDocument"></v-icon>
          </template>
        </v-list-item>
        <v-list-item
          title="Logout"
          @click="
            () => {
              authStore.logout()
              router.push('/')
            }
          "
        >
          <template #prepend>
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
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import { mdiLogout, mdiMapMarkerMultiple, mdiBug, mdiFileDocument } from '@mdi/js'
import { DrawerItem } from '@/model/ReimsModel'
import { useDisplay } from 'vuetify'
import { useOnline } from '@vueuse/core'

const LocationDialog = defineAsyncComponent(() => import('@/components/LocationDialog.vue'))

const isOnline = useOnline()
const { mobile } = useDisplay()

defineProps<{
  mainItems: DrawerItem[]
  otherItems: DrawerItem[]
}>()

const rootStore = useRootStore()
const authStore = useAuthStore()
const router = useRouter()
const reimsSiteName = computed(() => rootStore.reimsSiteName)

const dialog = ref(false)
const isDrawerOpen = computed(() => {
  if (mobile.value) return rootStore.drawer
  else return true // always open on desktop
})

const isMiniDrawer = computed(() => {
  // Only on desktop and if drawer on mobile would be open
  return !mobile.value && !rootStore.drawer
})

const commitUrl = computed(() => {
  return 'https://github.com/reims2/reims2-frontend/commit/' + rootStore.version
})
</script>

<style scoped>
.dev-background {
  background-color: #e57373;
}
.no-decoration {
  text-decoration: none !important;
}
.no-color {
  color: inherit !important;
}

.bigger-text .v-list-item-title {
  font-size: 1.2rem !important;
}
</style>
