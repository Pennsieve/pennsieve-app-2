import { mount } from 'vue-test-utils'
import Vuex from 'vuex'
import { state, getters } from '@/vuex/store'
import EmbargoedPermissions from './EmbargoedPermissions.vue'
import flushPromises from 'flush-promises'

const $route = {
  name: 'embargoed-permissions',
  params:{
    datasetId: '234'
  }
}

const dataset = {
  "content": {
    "id": "N:dataset:ce6ef3be-26ca-44c6-a74b-b80b8d7be14d",
    "name": "Cameron's Dataset",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vitae nunc ante. In luctus aliquet libero, eleifend pulvinar nisi egestas a. Donec vitae leo hendrerit, hendreaaassdf\n\n",
    "state": "READY",
    "createdAt": "2019-12-17T18:48:48.952021Z",
    "updatedAt": "2020-07-27T16:41:58.3605Z",
    "packageType": "DataSet",
    "datasetType": "research",
    "status": "NO_STATUS",
    "automaticallyProcessPackages": false,
    "license": "Community Data License Agreement – Permissive",
    "tags": ["tag", "1"],
    "intId": 219
  },
  "organization": "N:organization:050fae39-4412-43ef-a514-703ed8e299d5",
  "children": [],
  "owner": "N:user:0a14a358-bd5e-48de-98ec-2ba6557bbde3",
  "collaboratorCounts": { "users": 3, "organizations": 1, "teams": 0 },
  "storage": 184404290,
  "status": {
    "id": 1,
    "name": "NO_STATUS",
    "displayName": "No Status",
    "color": "#71747C",
    "inUse": true
  },
  "publication": {
    "publishedDataset": {
      "id": 190,
      "version": 1,
      "lastPublishedDate": "2020-07-02T18:25:57.045462Z"
    },
    "status": "rejected",
    "type": "publication"
  },
  "properties": [],
  "canPublish": true,
  "bannerPresignedUrl": ""
}

describe('EmbargoedPermissions.vue', () => {
  let cmp
  let store
  let testState

  beforeEach(() => {
    testState = {
      ...state,
      config: {
        apiUrl: 'https://api.pennsieve.net'
      },
      userToken: '123',
      dataset
    }
    store = new Vuex.Store({
      state: testState,
      getters
    })
    cmp = mount(EmbargoedPermissions, {
      store,
      mocks: {
        $route
      }
    })
    cmp.setData({
      embargoedRequests: [
        {
          userId: '123',
          firstName: 'Sam',
          lastName: 'Smith',
          email: 'smm1234@blackfynn.com',
          status: 'requested'
        }
      ]
    })
    cmp.update()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('embargoedRequestsUrl', () => {
    const url = 'https://api.pennsieve.net/datasets/234/publication/preview?api_key=123'
    expect(cmp.vm.embargoedRequestsUrl).toEqual(url)
  })

  it('getEmbargoedRequests', (done) => {
    const spy = jest.spyOn(cmp.vm, 'getEmbargoedRequests')
    fetch.mockResponseOnce('', {status: 200})
    cmp.vm.getEmbargoedRequests()
    flushPromises().then(() => {
      expect(spy).toBeCalled()
      done()
    })
  })

  it('acceptRequest', (done) => {
    const userId = '123'
    const list = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        email:'smm1234@blackfynn.com',
        userId: '123',
        status: 'granted'
      }
    ]
    const spy = jest.spyOn(cmp.vm, 'acceptRequest')
    fetch.mockResponseOnce('', {status: 200})
    cmp.vm.acceptRequest(userId)
    flushPromises().then(() => {
      expect(spy).toBeCalled()
      expect(cmp.vm.embargoedRequests).toMatchObject(list)
      done()
    })
  })

  it('rejectRequest', (done) => {
    const request = {
      userId: '123',
      firstName: 'Sam',
      lastName: 'Smith',
      email: 'smm1234@blackfynn.com',
      status: 'requested'
    }
    const spy = jest.spyOn(cmp.vm, 'rejectRequest')
    fetch.mockResponseOnce('', {status: 200})
    cmp.vm.rejectRequest(request)
    flushPromises().then(() => {
      expect(spy).toBeCalled()
      done()
    })
  })
})
