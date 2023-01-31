import type { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s | REIMS2',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/css/main.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // https://github.com/iFgR/vue-shortkey
    { src: '@/plugins/vue-shortkey.js', mode: 'client' },
    // https://github.com/ajomuch92/vue-enter-to-tab
    { src: '@/plugins/vue-enter-to-tab.js', mode: 'client' },
    // https://github.com/nuxt-community/pwa-module/issues/239#issuecomment-796807081
    { src: '~/plugins/pwa-update.js', mode: 'client' },
    // https://github.com/robinvdvleuten/vuex-persistedstate#example-with-nuxtjs
    { src: '~/plugins/persistedState.js', mode: 'client' },
    // https://zaengle.com/blog/error-handling-in-nuxt-apps
    { src: '~/plugins/axios-error-handling.js' }
  ],

  ssr: false, // Disable Server Side rendering

  /*
  ** Customize the automatic progress-bar
  ** https://nuxtjs.org/docs/2.x/features/loading
  */
  loading: {
    color: '#1976D2', // blue.darken2
    height: '5px',
    duration: 3000,
    continuous: true,
    throttle: 200
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
    '@nuxtjs/proxy',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://auth.nuxtjs.org/
    '@nuxtjs/auth-next',
    // https://github.com/nuxt-community/dayjs-module#readme
    '@nuxtjs/dayjs',
    // https://github.com/dword-design/nuxt-route-meta
    'nuxt-route-meta'
  ],

  proxy: { // https://axios.nuxtjs.org/options/#proxy
    '/api': { target: process.env.API_URL, pathRewrite: { '^/api': '' }, ws: false },
    '/docs': { target: process.env.DOCS_URL }
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    proxy: true,
    progress: true, // show loading bar
    retry: false
  },

  env: {
    // @ts-ignore
    isDev: process.env.PVH_DEBUG === 'true' || false,
    version: process.env.GIT_REV || ''
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    meta: {
      name: 'REIMS2',
      author: 'Partners for Visual Health',
      ogHost: 'reims2.app',
      description: 'REIMS2 is the next version of the Richmond Eyeglass Inventory Matching System. ' +
      'It supports the annual visual health campaigns run by Partners for Visual Health.'
    },
    manifest: {
      name: 'REIMS2',
      short_name: 'REIMS2',
      description: 'REIMS2 is the next version of the Richmond Eyeglass Inventory Matching System. ' +
      'It supports the annual visual health campaigns run by Partners for Visual Health.'
    },
    workbox: {
      workboxExtensions: '@/plugins/bg-sync.js'
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
      local: {
        token: {
          property: 'accessToken'
        },
        user: {
          property: false
        },
        endpoints: {
          user: { url: '/api/auth/user' },
          login: { url: '/api/auth/signin', method: 'post' }
        }
      }
    },
    cookie: {
      options: {
        secure: true
        // samesite: 'lax'
      }
    }
  },

  // https://npmjs.com/package/@nuxtjs/dayjs
  dayjs: {
    locales: ['en'],
    defaultLocale: 'en',
    plugins: [
      'relativeTime'
    ] // Your Day.js plugin
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    theme: {
      light: true,
      themes: {
        light: {
          primary: '#005c66',
          secondary: '#67697C',
          accent: '#b34c00',
          background: '#FFF'
        }
      },
      options: { customProperties: true }
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
    middleware: ['auth']
  }
}

export default config
