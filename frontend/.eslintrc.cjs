module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    'standard',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-typescript/recommended',
    './src/.eslintrc-auto-import.json',
    'prettier',
  ],
  rules: {
    'spaced-comment': 'warn',
    'no-warning-comments': 'warn',
  },
}
