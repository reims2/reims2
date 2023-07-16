import { defineStore } from 'pinia'
import { Notification } from '@/lib/notifications'
import { ReimsSite } from '@/model/ReimsModel'

export const useRootStore = defineStore({
  id: 'root',
  persist: {
    paths: ['reimsSite', 'drawer'],
  },
  state: () => ({
    notification: null as Notification | null,
    drawer: true,
    isDev: false,
    reimsSite: 'sa' as ReimsSite,
    version: '0.0.0',
  }),
  actions: {
    toggleDrawer() {
      this.drawer = !this.drawer
    },
  },
})
