import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import CheckActiveUser from './CheckActiveUser.vue'
import { getters } from '../../vuex/store'
import EventBus from '../../utils/event-bus'

import Amplify from '@aws-amplify/core'
import Auth from '@aws-amplify/auth'
import AWSConfig from '@/utils/aws-exports.js'
Amplify.configure(AWSConfig)

describe('CheckActiveUser.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        userToken: '123'
      },
      getters
    })
    cmp = shallow(CheckActiveUser, { store })
    cmp.vm.interval = 100
  })

  afterEach(() => {
    EventBus.$off()
  })

  it('sets timeout when userToken is not empty', (done) => {
    cmp.vm.pingUserActive()
    cmp.vm.$nextTick(() => {
      expect(cmp.vm.pingUserHandle).not.toBeNull()
      done()
    })
  })

  it('pingUserActive: handles 200 status', (done) => {
    fetch.mockResponse('*', 200)
    cmp.vm.pingUserActive()
    setTimeout(() => {
      expect(cmp.vm.pingUserHandle).not.toBe(null)
      done()
    }, 1000)
  })

  it('handleActiveUser: handles active user', (done) => {
    const spy = jest.spyOn(Auth, 'currentSession').mockReturnValue({
      getAccessToken: () => ({
        getJwtToken: () => ("Secret-Token")
      })
    });
    cmp.vm.pingUserActive()
    setTimeout(() => {
      expect(spy).toBeCalled()
      done()
    }, 1000)
  })

  it('handleActiveUser: handles inactive user', (done) => {

    EventBus.$on('logout', _ => {
      done()
    })
    cmp.vm.callLogout()
  })
})
