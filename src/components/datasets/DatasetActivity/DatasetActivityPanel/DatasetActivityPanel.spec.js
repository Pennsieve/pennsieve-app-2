import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import DatasetActivityPanel from './DatasetActivityPanel.vue'
import { state, actions, mutations, getters } from '@/vuex/store'

const februaryEvent = {
  datasetId: 514,
  userIds: [29],
  eventType: 'DELETE_MODEL_PROPERTY',
  totalCount: 3,
  timeRange: { start: '2021-02-01T17:11:07Z', end: '2021-02-01T17:13:08Z' },
  eventCursor:
    'eyJldmVudFR5cGUiOiJERUxFVEVfTU9ERUxfUFJPUEVSVFkiLCJzdGFydCI6IjIwMjEtMDItMDFUMTc6MTE6MDdaIiwiZW5kIjpbIjIwMjEtMDItMDFUMTc6MTM6MDhaIiwzNzNdfQ=='
}

const februaryEvent2 = {
  datasetId: 514,
  userIds: [29],
  eventType: 'CREATE_PACKAGE',
  totalCount: 4,
  timeRange: {
    start: '2021-02-01T17:25:59.895Z',
    end: '2021-02-01T23:03:19.997Z'
  },
  eventCursor:
    'eyJldmVudFR5cGUiOiJDUkVBVEVfUEFDS0FHRSIsInN0YXJ0IjoiMjAyMS0wMi0wMVQxNzoyNTo1OS44OTVaIiwiZW5kIjpbIjIwMjEtMDItMDFUMjM6MDM6MTkuOTk3WiIsMjI5MzZdfQ=='
}

const marchEvent = {
  datasetId: 514,
  userIds: [29],
  eventType: 'CREATE_PACKAGE',
  totalCount: 4,
  timeRange: {
    start: '2021-03-01T17:25:59.895Z',
    end: '2021-03-01T23:03:19.997Z'
  },
  eventCursor:
    'eyJldmVudFR5cGUiOiJDUkVBVEVfUEFDS0FHRSIsInN0YXJ0IjoiMjAyMS0wMi0wMVQxNzoyNTo1OS44OTVaIiwiZW5kIjpbIjIwMjEtMDItMDFUMjM6MDM6MTkuOTk3WiIsMjI5MzZdfQ=='
}

describe('DatasetActivityPanel.vue', () => {
  const cmp = shallow(DatasetActivityPanel, {
    propsData: {
      event: februaryEvent
    },
    store: new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
  })

  it('Should show date group heading', () => {
    expect(cmp.vm.dateGroupHeading).toBe('February 2021')
  })

  it('Should show date group heading because event date before is different than this one', () => {
    cmp.setProps({
      previousEvent: marchEvent
    })
    expect(cmp.vm.dateGroupHeading).toBe('February 2021')
  })

  it('Should not show date group heading because event date before is the same as this one', () => {
    cmp.setProps({
      previousEvent: februaryEvent2
    })
    expect(cmp.vm.dateGroupHeading).toBe('')
  })
})
