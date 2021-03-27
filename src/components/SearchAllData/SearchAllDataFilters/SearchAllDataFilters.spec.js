import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import { actions, mutations, getters, state } from '@/vuex/store'

import SearchAllDataFilters from './SearchAllDataFilters.vue'

describe('SearchAllDataFilters.vue', () => {
  let cmp
  let store

  beforeEach( () => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(SearchAllDataFilters, {
      store
    })
  })

  it('Displays three filters', () => {
    cmp.setData({ filters: [
      {
        id: 0
      },
      {
        id: 1
      },
      {
        id: 3
      }
    ]})

    const filters = cmp.findAll('.search-filter')
    expect(filters.length).toBe(3)
  })

  it.skip('Can add a filter', () => {
    cmp.setData({ filters: [
      {
        id: 0
      }
    ]})

    const btnAddFilter = cmp.find('button.linked')
    btnAddFilter.trigger('click')

    const filters = cmp.findAll('.search-filter')
    expect(filters.length).toBe(2)
  })

  it.skip('Can remove a filter', () => {
    cmp.setData({ filters: [
      {
        id: 0
      },
      {
        id: 1
      }
    ]})

    const btnDeleteFilter = cmp.find('.btn-delete')
    btnDeleteFilter.trigger('click')

    const filters = cmp.findAll('.search-filter')
    expect(filters.length).toBe(1)
  })

  // it('Can clear filters', () => {
  //   cmp.setData({ filters: [
  //     {
  //       id: 0
  //     },
  //     {
  //       id: 1
  //     }
  //   ]})

  //   const btnClearfilters = cmp.find('.bf-button.secondary')
  //   btnClearfilters.trigger('click')

  //   const filters = cmp.findAll('.search-filter')
  //   expect(filters.length).toBe(1)
  // })
})
