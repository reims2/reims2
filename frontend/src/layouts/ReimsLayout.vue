<template>
  <v-app>
    <the-drawer :main-items="mainItems" :other-items="otherItems" />
    <the-header />
    <v-main class="background">
      <router-view v-slot="{ Component }" class="py-6 px-6">
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
    <the-bottom-bar v-if="mobile" :items="mainItems" />
    <the-footer v-if="!mobile" :show-last-update="true" />
  </v-app>
</template>

<script setup lang="ts">
import {
  mdiFileFind,
  mdiPencil,
  mdiDatabase,
  mdiPlusCircle,
  mdiChartBox,
  mdiAccountEdit,
} from '@mdi/js'
import { useDisplay } from 'vuetify'
import dayjs from 'dayjs'

import TheFooter from '@/components/TheFooter.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheDrawer from '@/components/TheDrawer.vue'
import TheBottomBar from '@/components/TheBottomBar.vue'

import { useOnline } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useUpdatesGlassesInterval } from '@/composables/update-glasses'
import { useGlassesStore } from '@/stores/glasses'
import { useRouter } from 'vue-router'

const OfflineBanner = defineAsyncComponent(() => import('@/components/OfflineBanner.vue'))
const InitialLoadOverlay = defineAsyncComponent(() => import('@/components/InitialLoadOverlay.vue'))

const router = useRouter()
const glassesStore = useGlassesStore()
const hasGlassesLoaded = computed(() => glassesStore.hasGlassesLoaded)

useUpdatesGlassesInterval()

const { mobile } = useDisplay()
const authStore = useAuthStore()

const mainItems = computed(() => [
  { title: 'Find', icon: mdiFileFind, to: '/find' },
  { title: 'Edit', icon: mdiPencil, to: '/edit' },
  { title: 'View all', icon: mdiDatabase, to: '/view', disabled: !isOnline.value },
  { title: 'Add', icon: mdiPlusCircle, to: '/add', disabled: !isOnline.value },
])
const otherItems = computed(() => {
  const items = [
    { title: 'Reports', icon: mdiChartBox, to: '/manage/reports', disabled: !isOnline.value },
  ]
  if (authStore.user && authStore.roles && authStore.roles.includes('ROLE_ADMIN')) {
    items.push({
      title: 'Users',
      icon: mdiAccountEdit,
      to: '/manage/users',
      disabled: !isOnline.value,
    })
  }
  return items
})

const isOnline = useOnline()

onMounted(() => {
  if (authStore.expirationTime && dayjs().diff(authStore.expirationTime, 'days') > -7) {
    // Use 7 days as a safety because of service worker retries
    authStore.logout()
  }
})

// Auto redirect to Login when logged out
watch(
  () => authStore.isLoggedIn,
  (isLoggedIn) => {
    if (!isLoggedIn) {
      router.push({ name: 'Login' })
    }
  },
)
</script>
