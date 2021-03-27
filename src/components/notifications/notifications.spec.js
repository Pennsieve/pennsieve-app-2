import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import Notifications from './Notifications.vue'
import { actions, mutations, getters } from '../../vuex/store'
import EventBus from '../../utils/event-bus'

describe('Notifications.vue', () => {
  let cmp
  let store
  let state
  let newToken

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net/'
      },
      profile: {},
      userToken: '123',
      activeOrganization: {}
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(Notifications, {
      attachToDocument: true,
      store
    })
    cmp.setMethods({
      logger: jest.fn(() => {})
    })
    cmp.update()
  })

  afterEach(() => {
    EventBus.$off()
  })

  it('created: sets the config object', () => {
    expect(cmp.vm.websocketConfig.reopenInterval).toBe(cmp.vm.reopenInterval)
  })

  it('_watchUserToken: does not open a socket connection if userToken is null', () => {
    cmp.vm._watchUserToken(null)
    expect(cmp.vm.websocket).toBe(null)
  })

  it('_watchUserToken: opens a socket connection if userToken is present', () => {
    cmp.vm._watchUserToken('123')
    expect(cmp.vm.websocket).not.toBe(null)
  })

  it('open: callback after open socket connection', () => {
    const noop = jest.fn(() => {})
    cmp.vm._reopenAttempt = setTimeout(noop, 500)
    cmp.vm._onOpen()
    expect(noop.mock.calls.length).toBe(0)
  })

  it('openWebSocket', () => {
    cmp.vm._watchUserToken('123')
    cmp.vm.close()
    cmp.vm.openWebSocket()
    expect(cmp.vm.websocket).not.toBe(null)
  })

  it('send: does not send a websocket message', () => {
    cmp.vm.send({data: 'test'})
    expect(cmp.vm.websocket).toBe(null)
  })

  it('send: does not strigify object', () => {
    cmp.vm._watchUserToken('123')
    const spy = jest.spyOn(cmp.vm.websocket, 'send')
    cmp.vm.send(null)
    expect(spy).toBeCalled()
  })

  it('send: sends a websocket message', () => {
    cmp.vm._watchUserToken('123')
    const spy = jest.spyOn(cmp.vm.websocket, 'send')
    cmp.vm.send({data: 'test'})
    expect(spy).toBeCalled()
  })

  it('close: closes an open socket connection', () => {
    cmp.vm._watchUserToken('123')
    cmp.vm.close()
    expect(cmp.vm.websocket).toBe(null)
  })

  it('close: does nothing if called on a closed socket connection', () => {
    cmp.vm.close()
    expect(cmp.vm.websocket).toBe(null)
  })

  it('_onClose: fires when websocket is closed', (done) => {
    const spy = jest.spyOn(cmp.vm, 'openWebSocket')
    cmp.vm._onClose({ code: 1011 })
    setTimeout(() => {
      expect(spy).toBeCalled()
      done()
    }, 500)
  })

  it('_onClose: fires immediately when noDecay and websocket is closed', (done) => {
    const spy = jest.spyOn(cmp.vm, 'openWebSocket')
    cmp.vm.noDecay = true
    cmp.vm._onClose({})
    setTimeout(() => {
      expect(spy).toBeCalled()
      done()
    }, 100)
  })

  it('_onClose: does not fire if code === 1000 when websocket is closed', (done) => {
    const spy = jest.spyOn(cmp.vm, 'openWebSocket')
    cmp.vm._onClose({ code: 1000 })
    setTimeout(() => {
      expect(spy).not.toBeCalled()
      done()
    }, 500)
  })

  it('_onMessage: JobDoneNotification emits toast message', (done) => {
    EventBus.$on('toast', data => {
      expect(data.detail.msg).toBe('Your upload has finished processing.')
      done()
    })
    cmp.vm._watchUserToken('123')
    cmp.vm._onMessage({
      data: '[{"JobDoneNotification":{}}]'
    })
  })

  it('_onMessage: JobDoneNotification job-done message', (done) => {
    EventBus.$on('toast', data => {
      expect(data.detail.msg).toBe('Your upload has finished processing.')
    })
    EventBus.$on('job-done', data => {
      expect(data.detail.itemId).toBe('456')
      done()
    })
    cmp.vm._watchUserToken('123')
    cmp.vm._onMessage({
      data: '[{"JobDoneNotification":{"packageDTO": { "content": { "id": "456" }} }}]'
    })
  })

  it('_onMessage: emits MentionNotification message', (done) => {
    EventBus.$on('toast', data => {
      expect(data.detail.msg).toBe('You have been mentioned in a discussion about package test.')
      done()
    })
    cmp.vm._watchUserToken('123')
    cmp.vm._onMessage({
      data: '[{"MentionNotification":{"packageName":"test"}}]'
    })
  })

  it('_onMessage: does not emit MentionNotification message', () => {
    const spy = jest.spyOn(EventBus, '$on')
    cmp.vm._watchUserToken('123')
    cmp.vm._onMessage({
      data: '[{"MentionNotification":{}}]'
    })
    expect(spy).not.toBeCalled()
  })

  it('_onMessage: handles malformed JSON', (done) => {
    EventBus.$on('toast', data => {
      expect(data.detail.type).toBe('ERROR_DETAIL')
      done()
    })
    cmp.vm._watchUserToken('123')
    cmp.vm._onMessage({
      data: '[{"MentionNotification":{"packageName":"test"}]'
    })
  })

  it('_onMessage: handles PING', () => {
    cmp.vm._watchUserToken('123')
    const sendSpy = jest.spyOn(cmp.vm.websocket, 'send')
    cmp.vm._onMessage({
      data: '{"PING":"test"}'
    })
    expect(sendSpy).toBeCalled()
  })

  it('_onMessage: shortcircuits if there is no websocket connection', () => {
    cmp.vm._onMessage({
      data: '{"PING":"test"}'
    })
    expect(cmp.vm.websocket).toBe(null)
  })

  it('_onMessage: shortcircuits if json is set to false', () => {
    cmp.vm._watchUserToken('123')
    const spy = jest.spyOn(cmp.vm.websocket, 'send')
    cmp.vm._onMessage({
      data: null
    })
    expect(spy).not.toBeCalled()
  })

  it('_onError: calls logger', () => {
    cmp.vm._onError()
    expect(cmp.vm.logger.mock.calls.length).toBe(1)
  })

  it('destroy: lifecycle method test', () => {
    const spy = jest.spyOn(cmp.vm, 'close')
    cmp.destroy()
    expect(spy).toBeCalled()
  })
})
