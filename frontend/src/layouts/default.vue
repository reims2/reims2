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
import { mapState } from 'vuex'
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
        { title: 'Reports', icon: mdiChartBox, to: '/manage/reports', disabled: this.$nuxt.isOffline }
      ]
      if (this.$auth.user && this.$auth.user.roles && this.$auth.user.roles.map(el => el.name).includes('ROLE_ADMIN')) {
        list.push({ title: 'Users', icon: mdiAccountEdit, to: '/manage/users', disabled: this.$nuxt.isOffline })
      }
      return list
    },
    ...mapState(['lastRefresh'])

  },
  created() {
    this.updateGlasses()
    this.refreshGlassesInterval = setInterval(() => this.updateGlasses(), 3 * 60 * 1000)
  },
  beforeUnmount() {
    clearInterval(this.refreshGlassesInterval)
  },
  methods: {
    async updateGlasses() {
      try {
        await this.$store.dispatch('loadGlasses')
      } catch (error) {
        if (!this.lastRefresh) {
          this.$store.commit('setError', `Could not load glasses database, please retry (Error ${error.status})`)
        } else if (this.$dayjs().diff(this.lastRefresh) > 3 * 24 * 60 * 60 * 1000) {
          // if the last successful update is more than three day ago, mark DB as outdated
          this.$store.commit('setOutdatedFlag', true)
        }
        // else just fail silently because there's still a recent enough version of the DB cached
        console.log('DB update failed', error)
      }
    }
  }
}
</script>
