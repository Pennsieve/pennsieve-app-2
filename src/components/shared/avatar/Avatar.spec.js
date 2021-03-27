import { shallow } from 'vue-test-utils'
import Avatar from './Avatar.vue'
import Vuex from 'vuex'
import { getters } from '../../../vuex/store'


describe('Avatar.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    const state = {
      profile: {
        firstName: 'Jason',
        lastName: 'Kelce'
      }
    }
    store = new Vuex.Store({
      state,
      getters
    })
    cmp = shallow(Avatar, {
      store
    })
  })

  it('calculates initial', () => {
    const initial = cmp.vm.getInitial('firstName', cmp.vm.$store.state.profile)
    expect(initial).toBe('J')
  })
})