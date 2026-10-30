import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { type VuetifyOptions, createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export const vuetifyOptions: VuetifyOptions = {
  defaults: {
    VTextField: { variant: 'outlined' },
    VSelect: { variant: 'outlined' },
    VAutocomplete: { variant: 'outlined' },
    VCombobox: { variant: 'outlined' },
    VTextarea: { variant: 'outlined' },
  },
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
          'surface-muted': '#f4f7f7',
          error: '#ba1a1a',
          info: '#1a57c7',
          success: '#006d3c',
          warning: '#9e4300',
        },
        // Vuetify's 0.6 leaves labels and hints below the WCAG AA contrast ratio
        variables: { 'medium-emphasis-opacity': 0.7 },
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
