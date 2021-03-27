import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import cloneDeep from 'lodash.clonedeep'

import { state, actions, mutations } from '@/vuex/store'
import datasetModule from '@/vuex/modules/datasetModule'

import DatasetFilterMenu from './DatasetFilterMenu.vue'

const orgDatasetStatuses = [
  {
    "id": 1,
    "name": "NO_STATUS",
    "displayName": "No Status",
    "color": "#71747C",
    "inUse": true
  },
  {
    "id": 2,
    "name": "WORK_IN_PROGRESS",
    "displayName": "Work in Progress",
    "color": "#2760FF",
    "inUse": true
  },
  {
    "id": 3,
    "name": "IN_REVIEW",
    "displayName": "In Review",
    "color": "#FFB000",
    "inUse": true
  },
  {
    "id": 4,
    "name": "COMPLETED",
    "displayName": "Completed",
    "color": "#17BB62",
    "inUse": true
  }
]

describe('DatasetFilterMenu.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: cloneDeep(state),
      actions,
      mutations,
      modules: {
        datasetModule: cloneDeep(datasetModule)
      }
    })
    cmp = mount(DatasetFilterMenu, {
      attachToDocument: true,
      store
    })
  })

  it('Shows check for all datasets properly', async () => {
    const check = cmp.find('[data-menu-item="filter-ALL_DATASETS"] .item-icon-check')
    expect(check.exists()).toBe(true)

    await store.dispatch('datasetModule/updateDatasetSearchStatus', 'foo')
    const noCheck = cmp.find('[data-menu-item="filter-ALL_DATASETS"] .item-icon-check')
    expect(noCheck.exists()).toBe(false)
  })

  it('Shows check for permissions menu properly', async () => {
    const check = cmp.find('[data-menu-item="role-owner"] .item-icon-check')
    expect(check.exists()).toBe(false)

    await store.dispatch('datasetModule/updateDatasetSearchWithRole', 'owner')
    const noCheck = cmp.find('[data-menu-item="role-owner"] .item-icon-check')
    expect(noCheck.exists()).toBe(true)
  })

  it('Shows check for status menu properly', async () => {
    const check = cmp.find('[data-menu-item="role-owner"] .item-icon-check')
    expect(check.exists()).toBe(false)

    await store.dispatch('datasetModule/updateDatasetSearchWithRole', 'owner')
    const noCheck = cmp.find('[data-menu-item="role-owner"] .item-icon-check')
    expect(noCheck.exists()).toBe(true)
  })

  it('Shows check for status menu properly', async () => {
    // Not sure why I can't hydrate this in the `beforeEach()` but it wasn't being set right, so I use the store to update while running the test
    await store.dispatch('updateOrgDatasetStatuses', orgDatasetStatuses)

    const check = cmp.find('[data-menu-item="status-NO_STATUS"] .item-icon-check')
    expect(check.exists()).toBe(false)

    await store.dispatch('datasetModule/updateDatasetSearchStatus', 'NO_STATUS')
    const noCheck = cmp.find('[data-menu-item="status-NO_STATUS"] .item-icon-check')
    expect(noCheck.exists()).toBe(true)
  })

  it('Shows proper amount of statuses', async () => {
    // Not sure why I can't hydrate this in the `beforeEach()` but it wasn't being set right, so I use the store to update while running the test
    await store.dispatch('updateOrgDatasetStatuses', orgDatasetStatuses)

    const statusItems = cmp.findAll('.status-item')
    expect(statusItems).toHaveLength(4)
  })
})
