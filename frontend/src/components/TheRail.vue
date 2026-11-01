<template>
  <v-navigation-drawer permanent :width="112" color="primary" border="0">
    <nav aria-label="Main" class="d-flex flex-column align-center ga-2 h-100 py-5 text-on-rail">
      <router-link
        to="/"
        aria-label="REIMS2, home"
        class="text-title-large text-white text-decoration-none"
      >
        <reims-logo stacked />
      </router-link>
      <v-chip v-if="rootStore.isDev" size="x-small" variant="outlined" class="font-weight-bold">
        DEV
      </v-chip>
      <div class="my-3">
        <location-menu stacked />
      </div>

      <template v-for="(group, idx) in [items, secondaryItems]" :key="idx">
        <v-divider v-if="idx > 0 && group.length" class="w-50 my-1" />
        <div v-for="item in group" :key="item.to">
          <v-btn
            v-bind="railItem"
            :to="item.to"
            :active="false"
            :disabled="item.disabled"
            :variant="route.path === item.to ? 'flat' : 'text'"
            :color="route.path === item.to ? 'surface' : 'on-rail'"
            :class="{ 'font-weight-bold text-primary': route.path === item.to }"
            :prepend-icon="route.path === item.to ? item.activeIcon : item.icon"
          >
            {{ item.title }}
          </v-btn>
          <v-tooltip
            v-if="item.disabled"
            activator="parent"
            location="end"
            :text="`${item.title} needs an internet connection`"
            :aria-label="`${item.title} needs an internet connection`"
          />
        </div>
      </template>

      <v-spacer />
      <sync-status />
      <v-btn
        v-bind="railItem"
        variant="text"
        color="on-rail"
        :prepend-icon="mdiHelpCircleOutline"
        href="/docs/howto"
        target="_blank"
        rel="noopener noreferrer"
        :disabled="!isOnline"
      >
        Help
      </v-btn>
      <account-menu stacked />
    </nav>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { mdiHelpCircleOutline } from '@mdi/js'
import { useOnline } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useRootStore } from '@/stores/root'
import { NavItem } from '@/model/ReimsModel'
import LocationMenu from '@/components/LocationMenu.vue'
import SyncStatus from '@/components/SyncStatus.vue'
import AccountMenu from '@/components/AccountMenu.vue'
import ReimsLogo from '@/components/ReimsLogo.vue'

defineProps<{
  items: NavItem[]
  secondaryItems: NavItem[]
}>()

const route = useRoute()
const rootStore = useRootStore()
const isOnline = useOnline()

// every 96 x 56 item in the rail; SyncStatus and AccountMenu repeat these sizes
const railItem = { stacked: true, width: 96, height: 56, class: 'text-body-small' } as const
</script>
