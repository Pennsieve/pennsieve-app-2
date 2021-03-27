const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  verbose: true,
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest'
  },
  testRegex: '\\.spec\\.js?$',
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  setupFiles: ['<rootDir>/test/unit/setup'],
  mapCoverage: true,
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverageFrom: [
    'src/components/**/*.{vue}',
    'src/mixins/**/*.{js}',
    'src/vuex/store.js',
    '!src/main.js',
    '!src/mixins/global-message-handler/index.js',
    '!src/mixins/table-functions/index.js',
    '!src/components/bf-download-file/BfDownloadFile.vue',
    '!src/mixins/check-overflow/index.js',
    '!src/mixins/auto-focus/index.js',
    '!src/components/shared/bf-waiting-icon/bf-waiting-icon.vue',
    '!src/components/BfUpload/BfUpload.vue',
    '!src/routes/**/*',
    '!**/node_modules/**',
    '!**/web-components/**/*'
  ],
  testPathIgnorePatterns: [ '<rootDir>/node_modules/', '<rootDir>/web-components/' ]
}
