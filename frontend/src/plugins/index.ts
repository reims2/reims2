import type { App } from 'vue'
import './dayjs'
import vuetify from './vuetify'
import pinia from '../stores'
import router from '../router'

export function registerPlugins(app: App) {
  app.use(vuetify).use(router).use(pinia)
}
