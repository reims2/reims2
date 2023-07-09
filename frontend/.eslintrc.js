module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    'standard',
    'prettier',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    eqeqeq: 'warn', // don't error on wrong equality signs
    camelcase: 'warn', // don't error on non camel case
    'spaced-comment': 'warn',
    'no-warning-comments': 'warn',
    'no-console': 'off',
    '@typescript-eslint/no-var-requires': 'warn',
    'vue/valid-v-slot': ['error', { allowModifiers: true }],
  },
}
