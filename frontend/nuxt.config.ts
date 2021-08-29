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
    { src: '~/plugins/persistedState.js', mode: 'client' },
    // https://zaengle.com/blog/error-handling-in-nuxt-apps
    { src: '~/plugins/axios.js' }
  ],

  ssr: false, // Disable Server Side rendering

  /*
  ** Customize the automatic progress-bar
  ** https://nuxtjs.org/docs/2.x/features/loading
  */
  loading: {
    color: '#1976D2', // blue.darken2
    height: '5px',
    duration: 1000,
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
    '@nuxtjs/dayjs'
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

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    meta: {
      name: 'REIMS2',
      author: 'Partners for Visual Health',
      ogHost: 'reims2.app'
    },
    manifest: {
      name: 'REIMS2',
      short_name: 'REIMS2'
    },
    workbox: {
      runtimeCaching: [
        {
          // Should be a regex string. Compiles into new RegExp('https://my-cdn.com/.*')
          urlPattern: '/api/.*',
          method: 'PUT',
          strategyOptions: {
            cacheName: 'dispense-cache'
          },
          handler: 'NetworkOnly',
          strategyPlugins: [{
            use: 'BackgroundSync',
            config: {
              maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
            }
          }]
        }
      ]
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
          autoFetch: false
        },
        endpoints: {
          user: false,
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
    middleware: ['auth']
  }
}

export default config
