<template>
  <v-app>
    <app-drawer :main-items="mainItems" :other-items="otherItems" />
    <app-header />
    <v-main class="background">
      <router-view v-slot="{ Component }" class="py-6 px-6">
        <transition name="fade">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
      <offline-banner v-if="!isOnline" />
      <div v-if="!isOnline" style="min-height: 100px"></div>
    </v-main>
    <app-bottom-bar v-if="mobile" :items="mainItems" />
    <app-footer v-if="!mobile" :show-last-update="true" />
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

import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppDrawer from '@/components/AppDrawer.vue'
import AppBottomBar from '@/components/AppBottomBar.vue'

import { useOnline } from '@vueuse/core'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useUpdatesGlassesInterval } from '@/lib/update-glasses'

const OfflineBanner = defineAsyncComponent(() => import('@/components/OfflineBanner.vue'))

const toast = useToast()
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
  authStore.fetchUser()
  if (authStore.expirationTime && dayjs().diff(authStore.expirationTime, 'days') > -7) {
    // Use 7 days as a safety because of service worker retries
    toast.warning('Your session is expiring soon, please log in again.')
    authStore.logout()
  }
})
</script>
