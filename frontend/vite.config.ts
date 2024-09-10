// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import AutoImport from 'unplugin-auto-import/vite'
import browserslistToEsbuild from 'browserslist-to-esbuild'

// Utilities
import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

import { loadEnv } from 'vite'

const statusPlugin = {
  fetchDidSucceed: ({ response }) => {
    if (response.status >= 500) {
      // Throwing anything here will trigger fetchDidFail.
      throw new Error('Server error.')
    }
    // If it's not 5xx, use the response as-is.
    return response
  },
}

// https://vite-pwa-org.netlify.app/guide/
const vitePWAconf: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  manifest: {
    name: 'REIMS2',
    short_name: 'REIMS2',
    description:
      'REIMS2 is the next version of the Richmond Eyeglass Inventory Matching System. It supports the annual visual health campaigns run by Partners for Visual Health.',
    theme_color: '#005c66',
    icons: [
      {
        src: 'pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    navigateFallbackDenylist: [/^\/docs.*/, /^\/api\/.*/],
    globPatterns: ['**/*.{js,css,html,woff2}'],
    runtimeCaching: [
      {
        handler: 'NetworkOnly',
        urlPattern: /\/api\/glasses\/(un)?dispense.*/,
        method: 'PUT',
        options: {
          backgroundSync: {
            name: 'reimsDispenseQueue',
            options: {
              maxRetentionTime: 60 * 24 * 60, // retry dispense for 60 days
            },
          },
          plugins: [statusPlugin],
        },
      },
      {
        handler: 'NetworkOnly',
        urlPattern: /\/api\/glasses(\/[^/]+){2}\/?/,
        method: 'PUT',
        options: {
          backgroundSync: {
            name: 'reimsEditQueue',
            options: {
              maxRetentionTime: 7 * 24 * 60, // retry edit for 7 days
            },
          },
          plugins: [statusPlugin],
        },
      },
    ],
  },
}

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  return defineConfig({
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        autoImport: true,
        styles: {
          configFile: './src/assets/sass/vuetify.scss',
        },
      }),
      VitePWA(vitePWAconf),
      AutoImport({
        imports: ['vue'],
        eslintrc: {
          enabled: true,
          filepath: 'src/.eslintrc-auto-import.json',
        },
        dts: 'src/auto-imports.d.ts',
      }),
    ],
    test: {
      globals: true,
      environment: 'happy-dom',
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      server: {
        deps: {
          inline: ['vuetify'],
        },
      },
      coverage: {
        provider: 'v8',
        all: true,
        exclude: ['.yarn/**', '**/test/**', 'e2e/**'],
        include: ['src/**'],
      },
    },
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@/': fileURLToPath(new URL('./src/', import.meta.url)),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL,
          secure: false,
          autoRewrite: true,
          changeOrigin: true,
        },
      },
      strictPort: true,
    },
    build: {
      target: browserslistToEsbuild(),
      rollupOptions: {
        // https://rollupjs.org/guide/en/#outputmanualchunks
        output: {
          manualChunks: {},
        },
      },
    },
  })
}
