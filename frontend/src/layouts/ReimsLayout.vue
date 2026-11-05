<template>
  <v-app>
    <the-header v-if="mobile" />
    <the-rail v-else :items="navItems" :secondary-items="secondaryNavItems" />
    <v-main>
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
      <initial-load-overlay v-if="!hasGlassesLoaded" />
      <offline-banner v-else-if="!isOnline" />
      <div v-if="!isOnline" style="min-height: 100px"></div>
    </v-main>
    <the-bottom-bar v-if="mobile" :items="[...navItems, ...secondaryNavItems]" />
  </v-app>
</template>

<script setup lang="ts">
import {
  mdiArchive,
  mdiArchiveOutline,
  mdiChartBox,
  mdiChartBoxOutline,
  mdiMagnify,
  mdiPencil,
  mdiPencilOutline,
  mdiPlusCircle,
  mdiPlusCircleOutline,
} from '@mdi/js'
import { useDisplay } from 'vuetify'

import TheHeader from '@/components/TheHeader.vue'
import TheRail from '@/components/TheRail.vue'
import TheBottomBar from '@/components/TheBottomBar.vue'
import OfflineBanner from '@/components/OfflineBanner.vue'
import InitialLoadOverlay from '@/components/InitialLoadOverlay.vue'

import { useOnline } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useUpdatesGlassesInterval } from '@/composables/update-glasses'
import { useGlassesStore } from '@/stores/glasses'
import { useRouter } from 'vue-router'
import { NavItem } from '@/model/ReimsModel'

const router = useRouter()
const glassesStore = useGlassesStore()
const hasGlassesLoaded = computed(() => glassesStore.hasGlassesLoaded)

useUpdatesGlassesInterval()

const { mobile } = useDisplay()
const authStore = useAuthStore()

const navItems = computed<NavItem[]>(() => [
  { title: 'Find', icon: mdiMagnify, activeIcon: mdiMagnify, to: '/find' },
  { title: 'Edit', icon: mdiPencilOutline, activeIcon: mdiPencil, to: '/edit' },
  {
    title: 'Add',
    icon: mdiPlusCircleOutline,
    activeIcon: mdiPlusCircle,
    to: '/add',
    disabled: !isOnline.value,
  },
  {
    title: 'Inventory',
    icon: mdiArchiveOutline,
    activeIcon: mdiArchive,
    to: '/view',
  },
])

const secondaryNavItems = computed<NavItem[]>(() => [
  {
    title: 'Reports',
    icon: mdiChartBoxOutline,
    activeIcon: mdiChartBox,
    to: '/manage/reports',
    disabled: !isOnline.value,
  },
])

const isOnline = useOnline()

// Auto redirect to the start page when logged out
watch(
  () => authStore.isLoggedIn,
  (isLoggedIn) => {
    if (!isLoggedIn) {
      router.push({ name: 'Home' })
    }
  },
)
</script>
