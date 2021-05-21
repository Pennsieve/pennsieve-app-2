import Vue from 'vue'
import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import EventBus from '../../utils/event-bus'
import { actions, mutations, getters, state } from '../../vuex/store'

import request from './'

describe('request Mixin', () => {
  let cmp
  let store
  let $router
  let $route

  beforeEach(() => {
    const TestComponent = Vue.component('test', {
      mixins: [
        request
      ]
    })
    $route = {
      matched: []
    }
    $router = {
      replace: () => {}
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(TestComponent, {
      mocks: {
        $route,
        $router
      },
      store
    })
  })

  afterEach(() => {
    fetch.resetMocks()
  })

  it('sendXhr: throws error if URL is not present', (done) => {
    const resp = cmp.vm.sendXhr('')
    resp.catch(err => {
      expect(err.message).toBe('Url is missing!')
      done()
    })
  })

  it('sendXhr: returns a payload if successful GET', (done) => {
    const response = JSON.stringify({'status': 200})
    fetch.mockResponse(response)

    const resp = cmp.vm.sendXhr('http://app.blackfynn.net/test')
    expect(cmp.vm.method).toBe('GET')
    expect(cmp.vm.body).toBe(null)

    resp.then(msg => {
      expect(msg.status).toBe(200)
      done()
    })
  })

  it('sendXhr: sends body if present', (done) => {
    const response = JSON.stringify({'status': 200})
    fetch.mockResponse(response)

    const body = { id: 1 }
    const resp = cmp.vm.sendXhr('http://app.blackfynn.net/test', {
      method: 'POST',
      body
    })
    expect(cmp.vm.method).toBe('POST')
    expect(cmp.vm.body).toBe(JSON.stringify(body))

    resp.then(msg => {
      expect(msg.status).toBe(200)
      done()
    })
  })

  it('sendXhr: handles error status code', (done) => {
    fetch.mockResponse({'message': 'Forbidden'}, {'status': 403})

    const resp = cmp.vm.sendXhr('http://app.blackfynn.net/test', {
      method: 'DELETE',
      body: { id: 1 }
    })

    resp.catch(msg => {
      expect(msg.status).toBe(403)
      done()
    })
  })

  it('handleXhrError: handles errors', (done) => {
    EventBus.$on('ajaxError', _ => {
      done()
    })
    cmp.vm.handleXhrError({status: 500})
    cmp.vm.$nextTick(() => {
      expect(cmp.vm.isLoading).toBe(false)
    })
  })

  it('handleXhrError: handles 401', () => {
    const spy = jest.spyOn(cmp.vm, 'handleLogout')
    cmp.vm.handleXhrError({status: 401})
    expect(spy).toBeCalled()
  })

  // it('handleXhrError: handles 403', () => {
  //   const spy = jest.spyOn(cmp.vm.$router, 'replace')
  //   cmp.vm.handleXhrError({status: 403})
  //   expect(spy).toBeCalled()
  // })

})
