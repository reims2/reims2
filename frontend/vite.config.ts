import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'

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
  },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        autoImport: true,
        // The configFile mode keeps state that Vitest's fsModuleCache skips on reruns, and tests need no CSS.
        styles:
          mode === 'test'
            ? 'none'
            : {
                configFile: './src/assets/sass/vuetify.scss',
              },
      }),
      VitePWA(vitePWAconf),
      AutoImport({
        imports: ['vue'],
        dts: 'src/auto-imports.d.ts',
      }),
    ],
    devtools: { apply: 'serve' },
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
        exclude: ['**/test/**', 'e2e/**'],
        include: ['src/**'],
      },
    },
    resolve: {
      alias: {
        '@/': fileURLToPath(new URL('./src/', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          secure: false,
          autoRewrite: true,
          changeOrigin: true,
        },
      },
      strictPort: true,
    },
  }
})
