/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import unhead from './unhead'
import auth from './auth'
import pinia from '../stores'
import router from '../router'
// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  loadFonts()
  app.use(vuetify).use(router).use(pinia).use(auth).use(unhead)
}
