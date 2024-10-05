module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:playwright/recommended',
    'prettier',
  ],
  rules: {
    'spaced-comment': 'warn',
    'no-warning-comments': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
}
