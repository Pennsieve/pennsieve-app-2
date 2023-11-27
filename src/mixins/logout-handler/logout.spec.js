import Vue from 'vue'
import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import EventBus from '../../utils/event-bus'
import Cookies from 'js-cookie'
import { state, actions, mutations, getters } from '../../vuex/store'

import App from '../../components/app/App.vue'
import logout from './'

global.ga = jest.fn(() => {})

describe('logout Mixin', () => {
  let cmp
  let store
  let $router
  let $route

  beforeEach(() => {
    $route = {
      matched: [],
      fullPath: '/datasets'
    }
    $router = {
      replace: () => {}
    }
    store = new Vuex.Store({
      state: Object.assign({}, state, {userToken: '123'}),
      actions,
      mutations,
      getters
    })
    cmp = mount(App, {
      attachToDocument: true,
      mocks: {
        $route,
        $router
      },
      store
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
    EventBus.$off()
  })

  it('handleLogout', (done) => {
    const cookieSpy = jest.spyOn(Cookies, 'remove')
    const vuexSpy = jest.spyOn(cmp.vm, 'clearState')
    const routerSpy = jest.spyOn(cmp.vm.$router, 'replace')

    EventBus.$on('toast', () => {
      expect(cookieSpy).toBeCalledWith('user_token')
      expect(routerSpy).toHaveBeenCalledWith({ name: 'home', query: {} })
      expect(vuexSpy).toBeCalled()
      done()
    })

    cmp.vm.handleLogout( { shouldShowToast: true })
  })
})
