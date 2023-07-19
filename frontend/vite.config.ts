// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import AutoImport from 'unplugin-auto-import/vite'
// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

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
  workbox: {
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
export default defineConfig({
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
        target: process.env.VITE_API_URL || 'http://localhost:9966/',
      },
    },
    strictPort: true,
  },
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#outputmanualchunks
      output: {
        manualChunks: {},
      },
    },
  },
})
