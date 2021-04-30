module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/strongly-recommended',
    'plugin:nuxt/recommended',
    'standard'
  ],
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    'multiline-ternary': 'warn',
    eqeqeq: 'warn', // don't error on wrong equality signs
    camelcase: 'warn', // don't error on non camel case
    quotes: 'warn', // don't error on double qoutes
    'comma-dangle': 'warn',
    'spaced-comment': 'warn',
    semi: 'off', // no preference for semicolons at end
    'no-warning-comments': 'warn',
    'vue/valid-v-slot': 'off', // false positives for vuetify
    'vue/html-quotes': 'off', // doesn't work properly
    'space-before-function-paren': ['warn', 'never'] // no space before function parentheses because that looks weird
  }
}
