import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import { actions, mutations, getters } from '../../../../vuex/store'
import DatasetFileTypes from './DatasetFileTypes.vue'
import EventBus from '../../../../utils/event-bus'
import flushPromises from 'flush-promises'

const fileTypes = {
  "Tabular": 20,
  "Collection": 21,
  "PDF": 1,
  "MRI": 4,
  "Text": 1,
  "Slide": 5,
  "TimeSeries": 13,
  "Image": 3,
  "Unknown": 7,
  "Video": 2
}

describe('DatasetFileTypes.vue', () => {
  let cmp
  let store
  let state

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      userToken: '123',
      datasets: [],
      dataset: {
        content: {
          id: `N:dataset:8ac69a98-07f9-405c-b629-454c9fbf91ce`,
          name: `Cameron's test`,
          description: `This is my description!!`,
          state: `READY`,
          createdAt: `2018-03-08T21:21:37.14102Z`,
          updatedAt: `2018-03-28T14:41:28.714912Z`,
          packageType: `DataSet`
        },
        organization: `N:organization:c905919f-56f5-43ae-9c2a-8d5d542c133b`,
        owner: `N:user:2e4e659b-729c-4510-9918-40807105e3fb`,
        collaboratorCounts: {
          users: 2,
          organizations: 0,
          teams: 0
        },
        storage: 102544977,
        properties: []
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })

    cmp = mount(DatasetFileTypes, {
      attachToDocument: true,
      store
    })
    cmp.setMethods({
      createChart: jest.fn(() => {}),
      fetchFileTypes: jest.fn(() => {})
    })

    cmp.setData({fileTypes})
  })

  it('watch: getFileTypesUrl', (done) => {
    const spy = jest.spyOn(cmp.vm, 'fetchFileTypes')
    cmp.vm.$store.dispatch('setDataset', {
      content: {
        id: `123`,
        name: `Cameron's test`,
        description: `This is my description!!`,
        state: `READY`,
        createdAt: `2018-03-08T21:21:37.14102Z`,
        updatedAt: `2018-03-28T14:41:28.714912Z`,
        packageType: `DataSet`
      },
      organization: `N:organization:c905919f-56f5-43ae-9c2a-8d5d542c133b`,
      owner: `N:user:2e4e659b-729c-4510-9918-40807105e3fb`,
      collaboratorCounts: {
        users: 2,
        organizations: 0,
        teams: 0
      },
      storage: 102544977,
      properties: []
    })
    flushPromises().then(() => {
      expect(spy).toBeCalled()
      done()
    })
  })

  it('hasFileTypes', () => {
    expect(cmp.vm.hasFileTypes).toBe(true)
  })

  it('chartData', () => {
    expect(cmp.vm.chartData).toEqual([
      {"key": "Collection", "value": 21},
      {"key": "Tabular", "value": 20},
      {"key": "TimeSeries", "value": 13},
      {"key": "Unknown", "value": 7},
      {"key": "Other", "value": 16}
    ])
  })

  it('sortedFiles', () => {
    expect(cmp.vm.sortedFiles).toEqual([
      {'key': 'Collection', 'value': 21},
      {'key': 'Tabular', 'value': 20},
      {'key': 'TimeSeries', 'value': 13},
      {'key': 'Unknown', 'value': 7},
      {'key': 'Slide', 'value': 5},
      {'key': 'MRI', 'value': 4},
      {'key': 'Image', 'value': 3},
      {'key': 'Video', 'value': 2},
      {'key': 'PDF', 'value': 1},
      {'key': 'Text', 'value': 1}
    ])
  })

  it('totalFiles', () => {
    expect(cmp.vm.totalFiles).toBe(77)
  })

  it('getFileTypesUrl', () => {
    expect(cmp.vm.getFileTypesUrl).toBe('https://app.blackfynn.net/datasets/N:dataset:8ac69a98-07f9-405c-b629-454c9fbf91ce/packageTypeCounts?api_key=123')
  })

  it('fetchFileTypes(): success', (done) => {
    fetch.mockResponseOnce(JSON.stringify(fileTypes), {status: 200})
    cmp.vm.fetchFileTypes()
    flushPromises().then(() => {
      done()
    })
  })

  it('beforeDestroy()', () => {
    cmp.destroy()
    expect(cmp.vm.isLoading).toBe(true)
    expect(cmp.vm.fileTypes).toEqual({})
  })
})
