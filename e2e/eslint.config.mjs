import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import playwright from 'eslint-plugin-playwright'

export default tseslint.config(
  {
    ignores: ['*.d.ts', '**/test-results', '**/playwright-report', '**/.auth'],
  },
  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      playwright.configs['flat/recommended'],
    ],
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
      'playwright/expect-expect': [
        'warn',
        { assertFunctionNames: ['lookUpSku'] },
      ],
      'spaced-comment': 'warn',
      'no-warning-comments': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  eslintConfigPrettier,
)
