import 'vuetify/styles'
import '@/assets/sass/main.scss'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { type VuetifyOptions, createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export const vuetifyOptions: VuetifyOptions = {
  defaults: {
    VAlert: { rounded: 'lg' },
    VBtn: { variant: 'flat' },
    VCard: { rounded: 'xl' },
    VMenu: { VList: { nav: true, density: 'comfortable', elevation: 3 } },
    VSnackbarQueue: { color: '#2e3233', rounded: 'lg' },
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
          secondary: '#4f6366',
          background: '#f3f6f6',
          'on-background': '#191c1d',
          surface: '#ffffff',
          'on-surface': '#191c1d',
          'surface-light': '#f5f8f8',
          'on-surface-light': '#191c1d',
          'surface-muted': '#eaf0f0',
          'on-surface-muted': '#3d4647',
          'primary-tonal': '#e0eff1',
          'on-primary-tonal': '#00474f',
          error: '#ba1a1a',
          info: '#1a57c7',
          success: '#006d3c',
          warning: '#9e4300',
          // labels on the teal rail, and the sync states shown there
          'on-rail': '#d3e9ec',
          'rail-ok': '#8ce0b5',
          'rail-warn': '#ffcf7a',
        },
        variables: {
          // borders and dividers come out as #dbe3e4, tinted toward the teal
          'border-color': '#00363d',
          'border-opacity': 0.14,
          'high-emphasis-opacity': 1,
          // #4e5859 on white, 7:1
          'medium-emphasis-opacity': 0.78,
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
