<template>
  <v-app>
    <app-header />
    <app-drawer :main-items="mainItems" :other-items="otherItems" />
    <v-main class="background">
      <router-view keep-alive class="py-6 px-6" />
      <error-snackbar />
    </v-main>
    <app-bottom-bar v-if="rootStore.isMobile" :items="mainItems" />
    <app-footer v-if="!rootStore.isMobile" />
  </v-app>
</template>

<script>
import { mdiFileFind, mdiPencil, mdiDatabase, mdiPlusCircle, mdiChartBox } from '@mdi/js'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppDrawer from '@/components/AppDrawer.vue'
import AppBottomBar from '@/components/AppBottomBar.vue'
import ErrorSnackbar from '@/components/ErrorSnackbar.vue'
import { useRootStore } from '@/stores/root'
import { mapState } from 'pinia'

export default {
  inject: ['dayjs'],
  setup() {
    const rootStore = useRootStore()
    return { rootStore }
  },
  components: { AppFooter, AppHeader, AppDrawer, AppBottomBar, ErrorSnackbar },
  data: () => ({
    refreshGlassesInterval: '',
  }),
  computed: {
    mainItems() {
      return [
        { title: 'Find', icon: mdiFileFind, to: '/find' },
        { title: 'Edit', icon: mdiPencil, to: '/edit' },
        { title: 'View all', icon: mdiDatabase, to: '/view', disabled: this.rootStore.isOffline },
        { title: 'Add', icon: mdiPlusCircle, to: '/add', disabled: this.rootStore.isOffline },
      ]
    },
    otherItems() {
      const list = [
        {
          title: 'Reports',
          icon: mdiChartBox,
          to: '/manage/reports',
          disabled: this.rootStore.isOffline,
        },
      ]
      // TODO
      // if (this.$auth.user && this.$auth.user.roles && this.$auth.user.roles.map(el => el.name).includes('ROLE_ADMIN')) {
      //   list.push({ title: 'Users', icon: mdiAccountEdit, to: '/manage/users', disabled: this.rootStore.isOffline })
      // }
      return list
    },
    ...mapState(useRootStore, ['lastRefresh']),
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
        this.rootStore.loadGlasses()
      } catch (error) {
        if (!this.lastRefresh) {
          this.rootStore.setError(
            `Could not load glasses database, please retry (Error ${error.status})`,
          )
        } else if (this.dayjs().diff(this.lastRefresh) > 3 * 24 * 60 * 60 * 1000) {
          // if the last successful update is more than three day ago, mark DB as outdated
          this.rootStore.setOutdatedFlag(true)
        }
        // else just fail silently because there's still a recent enough version of the DB cached
        console.log('DB update failed', error)
      }
    },
  },
}
</script>
