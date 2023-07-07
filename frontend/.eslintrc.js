module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    'standard'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'multiline-ternary': 'warn',
    eqeqeq: 'warn', // don't error on wrong equality signs
    camelcase: 'warn', // don't error on non camel case
    'comma-dangle': 'warn',
    'spaced-comment': 'warn',
    'no-warning-comments': 'warn',
    'space-before-function-paren': ['warn', 'never'], // no space before function parentheses because that looks weird
    'no-console': 'off',
    '@typescript-eslint/no-var-requires': 'warn',
    semi: ['warn', 'never'],
    quotes: ['warn', 'single'],
    'vue/valid-v-slot': ['error', { allowModifiers: true }]
  }
}
