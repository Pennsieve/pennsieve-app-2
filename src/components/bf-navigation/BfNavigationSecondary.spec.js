import Vue from 'vue'
import Vuex from 'vuex'
import BfNavigationSecondary from './BfNavigationSecondary.vue'
import { shallow } from 'vue-test-utils'
import { actions, mutations, getters, state } from '../../vuex/store'

describe('BfNavigationSecondary.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(BfNavigationSecondary, {
      store
    })
  })

  it('toggleMenu', () => {
    cmp.vm.toggleMenu()
    expect(cmp.vm.secondaryNavCondensed).toBe(true)
  })
})
