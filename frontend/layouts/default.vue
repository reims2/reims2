<template>
  <v-app>
    <app-header />
    <app-drawer :main-items="mainItems" :other-items="otherItems" />
    <v-main class="background">
      <Nuxt keep-alive class="py-6 px-6" />
      <error-snackbar />
    </v-main>
    <app-bottom-bar v-if="$vuetify.breakpoint.mobile" :items="mainItems" />
    <app-footer v-if="!$vuetify.breakpoint.mobile" />
  </v-app>
</template>

<script>
import { mdiFileFind, mdiPencil, mdiDatabase, mdiPlusCircle, mdiAccountEdit, mdiChartBox } from '@mdi/js'
import AppFooter from '~/components/AppFooter.vue'
export default {
  components: { AppFooter },
  data: () => ({
    refreshGlassesInterval: ''

  }),
  computed: {
    mainItems() {
      return [
        { title: 'Find', icon: mdiFileFind, to: '/find' },
        { title: 'Edit', icon: mdiPencil, to: '/edit' },
        { title: 'View all', icon: mdiDatabase, to: '/view', disabled: this.$nuxt.isOffline },
        { title: 'Add', icon: mdiPlusCircle, to: '/add', disabled: this.$nuxt.isOffline }
      ]
    },
    otherItems() {
      const list = [
        { title: 'Create reports', icon: mdiChartBox, to: '/manage/reports', disabled: this.$nuxt.isOffline }
      ]
      if (this.$auth.user.roles && this.$auth.user.roles.map(el => el.name).includes('ROLE_ADMIN')) {
        list.push({ title: 'Manage users', icon: mdiAccountEdit, to: '/manage/users', disabled: this.$nuxt.isOffline })
      }
      return list
    }

  },
  created() {
    this.$store.dispatch('loadGlasses')
    this.refreshGlassesInterval = setInterval(() => this.$store.dispatch('loadGlasses'), 5 * 60 * 1000)
  },
  beforeDestroy() {
    clearInterval(this.refreshGlassesInterval)
  }
}
</script>
