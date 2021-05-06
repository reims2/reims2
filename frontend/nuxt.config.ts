import type { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: 'REIMS2 %s',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // https://github.com/iFgR/vue-shortkey
    { src: '@/plugins/vue-shortkey.js', mode: 'client' },
    // https://github.com/nuxt-community/pwa-module/issues/239#issuecomment-796807081
    { src: '~/plugins/pwa-update.js', mode: 'client' },
    // https://github.com/robinvdvleuten/vuex-persistedstate#example-with-nuxtjs
    { src: '~/plugins/persistedState.js', mode: 'client' }
  ],

  ssr: false, // Disable Server Side rendering

  /*
  ** Customize the automatic progress-bar
  ** https://nuxtjs.org/docs/2.x/features/loading
  */
  loading: {
    color: '#1976D2', // blue.darken2
    height: '3px',
    duration: 1000,
    continuous: true
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    // https://google-fonts.nuxtjs.org
    '@nuxtjs/google-fonts'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://auth.nuxtjs.org/
    '@nuxtjs/auth-next'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    meta: {
      name: 'REIMS2'
    }
  },

  // https://google-fonts.nuxtjs.org/options
  googleFonts: {
    download: true,
    families: {
      Roboto: true
    }
  },

  // https://auth.nuxtjs.org/guide/scheme
  auth: {
    strategies: {
      local: { /* ... */ }
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      light: true,
      themes: {
        light: {
          primary: '#00695C' // teal darken 3
        }
      }
    },
    defaultAssets: false, // dont use CDNs for libraries
    breakpoint: {
      mobileBreakpoint: 'sm' // This is equivalent to a value of 960
    },
    icons: {
      iconfont: 'mdiSvg'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  router: {
    // todo enable in future for auth
    // middleware: ['auth']
  }
}

export default config
