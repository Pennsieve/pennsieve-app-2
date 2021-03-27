import Vue from 'vue'
import Vuex from 'vuex'
import BfHeader from './BfHeader.vue'
import { state, actions, mutations, getters } from '../../vuex/store'
import { mount } from 'vue-test-utils'

const $route = {
  name: ''
}

const $router = {
  push: jest.fn(() => {})
}

const lastRoute = {
  name: 'dataset-files',
  params:{
    orgId: '123',
    datasetId: '234'
  }
}

describe('BfHeader.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(BfHeader, {
      attachToDocument: true,
      mocks: {
        $route,
        $router
      },
      store
    })
  })

  it('Closes viewer with last route', () => {
    const spy = jest.spyOn(cmp.vm.$router, 'push')

    cmp.vm.$route = {
      name: 'viewer'
    }

    cmp.vm.$store.dispatch('setLastRoute', lastRoute)

    cmp.vm.closeViewer()
    expect(spy).toBeCalled()
  })

  it('Closes viewer with no last route', () => {
    const spy = jest.spyOn(cmp.vm.$router, 'push')
    cmp.vm.$route = {
      name: 'viewer'
    }
    cmp.vm.$store.dispatch('setLastRoute', null)

    cmp.vm.closeViewer()
    expect(spy).toBeCalled()
  })

})
