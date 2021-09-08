<template>
  <v-app>
    <app-header />
    <app-drawer :main-items="mainItems" :other-items="otherItems" />
    <v-main>
      <offline-banner />
      <Nuxt keep-alive class="py-4" />
      <error-snackbar />
    </v-main>
    <app-bottom-bar v-if="$vuetify.breakpoint.mobile" :items="mainItems" />
    <app-footer v-if="!$vuetify.breakpoint.mobile" />
  </v-app>
</template>

<script>
import { mdiMagnify, mdiPencil, mdiDatabase, mdiPlusCircleOutline, mdiAccountEdit, mdiChartBox } from '@mdi/js'
import AppFooter from '~/components/AppFooter.vue'
export default {
  components: { AppFooter },
  data: () => ({
    mainItems: [
      { title: 'Find', icon: mdiMagnify, to: '/find' },
      { title: 'Edit', icon: mdiPencil, to: '/edit' },
      { title: 'View all', icon: mdiDatabase, to: '/data' },
      { title: 'Add', icon: mdiPlusCircleOutline, to: '/add' }
    ],
    otherItems: [
      { title: 'Manage users', icon: mdiAccountEdit, to: '/manage/users' },
      { title: 'Create reports', icon: mdiChartBox, to: '/manage/reports' }
    ]
  })
}
</script>
