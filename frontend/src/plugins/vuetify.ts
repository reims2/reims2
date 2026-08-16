/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Composables
import { VuetifyOptions, createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export const vuetifyOptions: VuetifyOptions = {
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  display: {
    mobileBreakpoint: 'sm',
    // v4 shrank the default breakpoints; restore v3's, matching assets/sass/vuetify.scss.
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
      xxl: 2560,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#005c66',
          secondary: '#67697C',
          accent: '#b34c00',
          background: '#FFF',
          error: '#ba1a1a',
          info: '#1a57c7',
          success: '#006d3c',
          warning: '#9e4300',
        },
      },
    },
    variations: {
      colors: ['primary'],
      lighten: 3,
      darken: 1,
    },
  },
}
export default createVuetify(vuetifyOptions)
