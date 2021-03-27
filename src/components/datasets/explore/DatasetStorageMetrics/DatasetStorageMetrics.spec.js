import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import { actions, mutations, getters } from '../../../../vuex/store'
import DatasetStorageMetrics from './DatasetStorageMetrics.vue'
import EventBus from '../../../../utils/event-bus'
import flushPromises from 'flush-promises'

const storage = {
  "2018-1": 560316204,
  "2018-3": 1680816204,
  "2018-2": 565316204,
  "2017-11": 504900000,
  "2017-12": 1780816204
}

describe('DatasetStorageMetrics.vue', () => {
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

    cmp = mount(DatasetStorageMetrics, {
      attachToDocument: true,
      store
    })
    cmp.setMethods({
      createChart: jest.fn(() => {}),
      fetchStorageMetrics: jest.fn(() => {})
    })

    cmp.setProps({storage})
  })

  it('watch: getMetricsUrl', (done) => {
    const spy = jest.spyOn(cmp.vm, 'fetchStorageMetrics')
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

  it('watch: chartData', (done) => {
    const spy = jest.spyOn(cmp.vm, 'createChart')
    flushPromises().then(() => {
      expect(spy).toBeCalled()
      done()
    })
  })

  it('hasMetrics', () => {
    expect(cmp.vm.hasMetrics).toBe(true)
  })

  // it('sortedStorage', () => {
  //   expect(cmp.vm.sortedStorage).toEqual({
  //     "2017-11-01": 504900000,
  //     "2017-12-01": 1780816204,
  //     "2018-01-01": 560316204,
  //     "2018-02-01": 565316204,
  //     "2018-03-01": 1680816204
  //   })
  // })

  // it('monthsRange', () => {
  //   expect(cmp.vm.monthsRange).toEqual([
  //     "2017-11-01",
  //     "2017-12-01",
  //     "2018-01-01",
  //     "2018-02-01",
  //     "2018-03-01"
  //   ])
  // })

  // it('chartLineData', () => {
  //   expect(cmp.vm.chartLineData).toEqual([
  //     {
  //       "value": "2017-11-01"
  //     },
  //     {
  //       "value": "2017-12-01"
  //     },
  //     {
  //       "value": "2018-01-01"
  //     },
  //     {
  //       "value": "2018-02-01"
  //     },
  //     {
  //       "value": "2018-03-01"
  //     }
  //   ])
  // })

  it('fetchStorageMetrics(): success', (done) => {
    fetch.mockResponseOnce(JSON.stringify(storage), {status: 200})
    cmp.vm.fetchStorageMetrics()
    flushPromises().then(() => {
      done()
    })
  })

  it('createChart() when chartData is computed', () => {
    const spy = jest.spyOn(cmp.vm, 'createChart')
    cmp.setProps({
      storage: {
        '2017-1': 1000
      }
    })
    expect(spy).toBeCalled()
  })

  it('getLastValue()', () => {
    const obj = {
      1: 123,
      2: 234,
      3: 345
    }
    const lastValue = cmp.vm.getLastValue(obj)
    expect(lastValue).toBe(345)
  })

  it('beforeDestroy()', () => {
    cmp.destroy()
    expect(cmp.vm.isLoading).toBe(true)
    expect(cmp.vm.storage).toEqual({})
    expect(cmp.vm.chart).toEqual({})
  })
})
