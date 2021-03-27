import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import AddRecordButton from './AddRecordButton.vue'
import { actions, mutations, getters, state } from '../../../vuex/store'
import EventBus from '../../../utils/event-bus'
import flushPromises from 'flush-promises'

const $route = {
  name: 'records',
  params:{
    orgId: '123',
    datasetId: '234'
  }
}

const $router = {
  push: jest.fn(() => {})
}

describe('AddRecordButton.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(AddRecordButton, {
      attachToDocument: true,
      mocks: {
        $route,
        $router
      },
      store
    })
  })

  it('displays concepts in menu', (done) => {
    const concepts = [
      {id: 1, name: 'Diseases', description: '', count: 3444},
      {id: 2, name: 'Visits', description: '', count: 783}
    ]
    cmp.vm.$store.dispatch('updateConcepts', concepts).then(() => {
      expect(cmp.vm.$store.state.concepts).toMatchObject(concepts)
      done()
    })
  })

  it('createInstance(): success', () => {
    const spy = jest.spyOn(cmp.vm.$router, 'push')
    cmp.vm.createInstance()
    expect(spy).toBeCalled()
  })
})
