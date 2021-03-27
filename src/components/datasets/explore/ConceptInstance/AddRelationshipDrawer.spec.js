import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import AddRelationshipDrawer from './AddRelationshipDrawer.vue'
import { actions, mutations, getters, state } from '../../../../vuex/store'

describe('AddRelationshipDrawer.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(AddRelationshipDrawer, {
      store
    })
  })

  it('disableButton: true', () => {
    expect(cmp.vm.disableButton).toBe(true)
  })

  it('disableButton: false', () => {
    cmp.vm.selectedItemIds = new Set(['test'])

    cmp.vm.relationshipVal = 'belongs_to'

    expect(cmp.vm.disableButton).toBe(false)
  })

  it('openDrawer', (done) => {
    cmp.vm.$store.state.concepts = [{
      id: 1,
      name: 'Studies'
    }, {
      id: 2,
      name: 'Animals'
    }]
    cmp.vm.openDrawer(1)
    expect.assertions(1);
    setTimeout(() => {
      expect(cmp.vm.visible).toBe(true)
      done()
    })

  })

  it('closeSideDrawer', () => {
    cmp.vm.closeSideDrawer()
    expect(cmp.vm.visible).toBe(false)
  })

  it('closeSideDrawer', () => {
    cmp.vm.closeSideDrawer()
    expect(cmp.vm.visible).toBe(false)
  })
})
