import Vue from 'vue'
import jestFetchMock from 'jest-fetch-mock'

Vue.config.productionTip = false

Vue.prototype.$message = () => {}

global.WebSocket = require('mock-socket').WebSocket
global.fetch = jestFetchMock
global.requestAnimationFrame = () => {}
global.SVGElement = Element

jest.setMock('node-fetch', jestFetchMock)

Object.defineProperty(document, 'cookie', {
  value: 'user_token=123; domain=app.pennsieve.net; path=/; expires=1434555910537'
})
