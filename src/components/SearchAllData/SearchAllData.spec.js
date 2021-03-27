import SearchAllData from './SearchAllData.vue'
import { mount } from 'vue-test-utils'
import Vuex from 'vuex'
import { state, actions } from '../../vuex/store.js'

const mockWindowProperty = (property, value) => {
  const { [property]: originalProperty } = window;
  delete window[property];
  beforeAll(() => {
    Object.defineProperty(window, property, {
      configurable: true,
      writable: true,
      value,
    });
  });
  afterAll(() => {
    window[property] = originalProperty;
  });
};


describe('SearchAllData.vue', () => {
  let cmp
  let store

  mockWindowProperty('localStorage', {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  })

  beforeEach( () => {
    store = new Vuex.Store({
      state,
      actions
    })
    cmp = mount(SearchAllData, {
      store
    })
  })

  it('Closes the Search Across All Datasets Modal', (done) => {
    const spy = jest.spyOn(cmp.vm, 'updateSearchModalVisible')
    cmp.vm.closeDialog()
    expect(spy).toBeCalled()
    done()
  })

  it('Calculates the modal width', () => {
    expect(cmp.vm.calculateModalWidth).toEqual('default-nav-modal-width')
  })
})
