<template>
  <v-app>
    <app-header />
    <app-drawer :main-items="mainItems" :other-items="otherItems" />
    <v-main class="background">
      <router-view keep-alive class="py-6 px-6" />
      <error-snackbar />
    </v-main>
    <app-bottom-bar v-if="mobile" :items="mainItems" />
    <app-footer :show-last-update="true" v-if="!mobile" />
  </v-app>
</template>

<script setup lang="ts">
import { mdiFileFind, mdiPencil, mdiDatabase, mdiPlusCircle, mdiChartBox } from '@mdi/js'
import { useDisplay } from 'vuetify'

import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppDrawer from '@/components/AppDrawer.vue'
import AppBottomBar from '@/components/AppBottomBar.vue'
import ErrorSnackbar from '@/components/ErrorSnackbar.vue'
import { useOnline } from '@vueuse/core'

import { computed, ref, onBeforeUnmount, watchEffect } from 'vue'
import { useRootStore } from '@/stores/root'

import dayjs from 'dayjs'
import { useNotification } from '@/lib/notifications'
const { addError } = useNotification()

const { mobile } = useDisplay()
const rootStore = useRootStore()
const refreshGlassesInterval: any | null = ref(null)

const mainItems = computed(() => [
  { title: 'Find', icon: mdiFileFind, to: '/find' },
  { title: 'Edit', icon: mdiPencil, to: '/edit' },
  { title: 'View all', icon: mdiDatabase, to: '/view', disabled: rootStore.isOffline },
  { title: 'Add', icon: mdiPlusCircle, to: '/add', disabled: rootStore.isOffline },
])
const otherItems = computed(() => [
  { title: 'Reports', icon: mdiChartBox, to: '/manage/reports', disabled: rootStore.isOffline },
  // TODO
  // if (this.$auth.user && this.$auth.user.roles && this.$auth.user.roles.map(el => el.name).includes('ROLE_ADMIN')) {
  //   list.push({ title: 'Users', icon: mdiAccountEdit, to: '/manage/users', disabled: this.rootStore.isOffline })
  // }
])

const isOnline = useOnline()
watchEffect(() => {
  rootStore.isOffline = !isOnline.value
})

updateGlasses()
refreshGlassesInterval.value = setInterval(() => updateGlasses(), 3 * 60 * 1000)

onBeforeUnmount(() => {
  clearInterval(refreshGlassesInterval.value)
})

async function updateGlasses() {
  try {
    rootStore.loadGlasses()
  } catch (error) {
    if (!rootStore.lastRefresh) {
      addError(`Could not load glasses database, please retry (Error ${error.status})`)
    } else if (dayjs().diff(rootStore.lastRefresh) > 3 * 24 * 60 * 60 * 1000) {
      // if the last successful update is more than three day ago, mark DB as outdated
      rootStore.isOutdated = true
    }
    // else just fail silently because there's still a recent enough version of the DB cached
    console.log('DB update failed', error)
  }
}
</script>
