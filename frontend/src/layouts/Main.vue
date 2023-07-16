<template>
  <v-app>
    <app-drawer :main-items="mainItems" :other-items="otherItems" />
    <app-header />
    <v-main class="background">
      <router-view keep-alive class="py-6 px-6" />
      <error-snackbar />
    </v-main>
    <app-bottom-bar v-if="mobile" :items="mainItems" />
    <app-footer :show-last-update="true" v-if="!mobile" />
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
import ErrorSnackbar from '@/components/ErrorSnackbar.vue'

import { useOnline } from '@vueuse/core'
import { useNotification } from '@/lib/notifications'
import { useGlassesStore } from '@/stores/glasses'
import { useAuthStore } from '@/stores/auth'

const { addError } = useNotification()

const { mobile } = useDisplay()
const glassesStore = useGlassesStore()
const authStore = useAuthStore()
const refreshGlassesInterval: any | null = ref(null)

const mainItems = computed(() => [
  { title: 'Find', icon: mdiFileFind, to: '/find' },
  { title: 'Edit', icon: mdiPencil, to: '/edit' },
  { title: 'View all', icon: mdiDatabase, to: '/view', disabled: !isOnline },
  { title: 'Add', icon: mdiPlusCircle, to: '/add', disabled: !isOnline },
])
const otherItems = computed(() => {
  const items = [
    { title: 'Reports', icon: mdiChartBox, to: '/manage/reports', disabled: !isOnline },
  ]
  if (authStore.user && authStore.roles && authStore.roles.includes('ROLE_ADMIN')) {
    items.push({
      title: 'Users',
      icon: mdiAccountEdit,
      to: '/manage/users',
      disabled: !isOnline,
    })
  }
  return items
})

const isOnline = useOnline()

onMounted(() => {
  authStore.fetchUser()
  updateGlasses()
  if (authStore.expirationTime && dayjs().diff(authStore.expirationTime, 'days') > -7) {
    // Use 7 days as a safety because of service worker retries
    addError('Your session is expiring soon, please log in again.')
    authStore.logout()
  }
})

updateGlasses()
refreshGlassesInterval.value = setInterval(() => updateGlasses(), 3 * 60 * 1000)

onBeforeUnmount(() => {
  clearInterval(refreshGlassesInterval.value)
})

async function updateGlasses() {
  try {
    glassesStore.loadGlasses()
  } catch (error) {
    if (!glassesStore.lastRefresh) {
      addError(`Could not load glasses database, please retry (Error ${error.status})`)
    } else if (dayjs().diff(glassesStore.lastRefresh) > 3 * 24 * 60 * 60 * 1000) {
      // if the last successful update is more than three day ago, mark DB as outdated
      glassesStore.isOutdated = true
    }
    // else just fail silently because there's still a recent enough version of the DB cached
    console.log('DB update failed', error)
  }
}
</script>
