import { defineConfig } from 'eslint/config'
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default defineConfig(
  {
    ignores: [
      '*.d.ts',

      // build output
      '**/coverage/**',
      '**/dist/**',

      // yarn/pnp internals
      '.yarn/**',
      '.pnp.cjs',
      '.pnp.loader.mjs',

      // vite generates these sometimes; never lint them
      '**/vite.config.*.timestamp-*.mjs',
    ],
  },
  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginVue.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // TypeScript already reports undefined names, including auto-imported globals
      'no-undef': 'off',
      'no-warning-comments': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  eslintConfigPrettier,
)
