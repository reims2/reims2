/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from './webfontloader'
// import axios from './axios'
import vuetify from './vuetify'
import dayjs from './dayjs'
import pinia from '../stores'
import router from '../router'
// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(dayjs)
    // .use(axios)
}
