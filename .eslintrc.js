// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended'
  ],
  env: {
    browser: true,
    jest: true
  },
  // add your custom rules here
  rules: {
    // allow debugger during development
    'array-element-newline': ['error', 'consistent'],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'complexity': ['warn', { 'max': 5 }]
  }
}
