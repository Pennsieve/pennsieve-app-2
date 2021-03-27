global.localStorage = {
  setItem: (key, val) => global.localStorage[key] = val,
  getItem: (key) => global.localStorage[key],
  removeItem: (key) => delete global.localStorage[key]
}

import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import ConceptsList from './ConceptsList.vue'
import { actions, mutations, getters, state } from '../../../../vuex/store'

describe('ConceptsList.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(ConceptsList, {
      store
    })
  })

  it('getDisplayOwnerMessage: displayOwnerMessage', () => {
    cmp.vm.$store.state.concepts = []
    expect(cmp.vm.displayOwnerMessage).toBe(true)
  })
})
