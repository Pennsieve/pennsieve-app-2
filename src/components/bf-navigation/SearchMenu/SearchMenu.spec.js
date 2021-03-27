import SearchMenu from './SearchMenu.vue'
import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import { actions } from '../../../vuex/store.js'


describe('SearchMenu.vue', () => {
  let cmp
  let store

  beforeEach( () => {
    store = new Vuex.Store({
      actions
    })
    cmp = mount(SearchMenu, {
      store,
      attachToDocument: true
    })
  })

  it('Opens up the Search Across All Datasets modal', (done) => {
    const spy = jest.spyOn(cmp.vm, 'updateSearchModalVisible')
    cmp.vm.openSearchModal()
    expect(spy).toBeCalled()
    done()
  })

  it('Opens up the Search Across All Datasets modal via keyboard shortcut', (done) => {
    const spy = jest.spyOn(cmp.vm, 'updateSearchModalVisible')

    cmp.trigger('keydown', {
      key: 's'
    })

    expect(spy).toBeCalled()
    done()
  })
})
