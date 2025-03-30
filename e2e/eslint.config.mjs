import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import playwright from 'eslint-plugin-playwright'

export default tseslint.config(
  {
    ignores: [
      '*.d.ts',
      '**/test-results',
      '**/playwright-report',
      '**/.yarn',
      '**/.auth',
    ],
  },
  {
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'spaced-comment': 'warn',
      'no-warning-comments': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  eslintConfigPrettier,
)

