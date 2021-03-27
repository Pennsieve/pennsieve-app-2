import SubmitDatasetDialog from './SubmitDatasetDialog.vue'
import Vuex from 'vuex'
import moment from 'moment'
import { mount } from 'vue-test-utils'
import { state } from 'vuex/store'

const embargoedDataset = {
  "content": {
    "id": "N:dataset:3a56f57f-2ff2-48d0-9801-17f0b6b8e806",
    "name": "Cameron's Embargoed Dataset",
    "description": "Embargoed dataset",
    "state": "READY",
    "createdAt": "2020-06-30T15:13:44.880683Z",
    "updatedAt": "2020-07-01T19:49:12.375393Z",
    "packageType": "DataSet",
    "datasetType": "research",
    "status": "NO_STATUS",
    "automaticallyProcessPackages": false,
    "license": "Community Data License Agreement – Permissive",
    "tags": ["embargo"],
    "intId": 1083
  },
  "organization": "N:organization:050fae39-4412-43ef-a514-703ed8e299d5",
  "owner": "N:user:0a14a358-bd5e-48de-98ec-2ba6557bbde3",
  "collaboratorCounts": { "users": 0, "organizations": 0, "teams": 0 },
  "status": {
    "id": 1,
    "name": "NO_STATUS",
    "displayName": "No Status",
    "color": "#71747C",
    "inUse": true
  },
  "publication": {
    "publishedDataset": { "version": 0 },
    "status": "rejected",
    "type": "embargo"
  },
  "properties": [],
  "canPublish": true
}

const publishedDataset = {
  "content":{
     "id":"N:dataset:41b71eda-4859-4a0f-8b26-2f5948fd46ff",
     "name":"Maha's December Dataset",
     "description":"Testing the Publication Settings workflow.lll",
     "state":"READY",
     "createdAt":"2020-11-30T17:46:25.434556Z",
     "updatedAt":"2020-12-07T20:46:02.853024Z",
     "packageType":"DataSet",
     "datasetType":"research",
     "status":"NO_STATUS",
     "automaticallyProcessPackages":false,
     "license":"Open Data Commons Attribution",
     "tags":[
        "tag1",
        "tag2",
        "tag3"
     ],
     "dataUseAgreementId":1,
     "intId":1385
  },
  "organization":"N:organization:050fae39-4412-43ef-a514-703ed8e299d5",
  "children":[

  ],
  "owner":"N:user:f6a047c4-f4fc-4a2a-ba70-58e97f716efe",
  "collaboratorCounts":{
     "users":0,
     "organizations":0,
     "teams":0
  },
  "status":{
     "id":1,
     "name":"NO_STATUS",
     "displayName":"No Status",
     "color":"#71747C",
     "inUse":true
  },
  "publication":{
     "publishedDataset":{
        "id":1811,
        "version":2,
        "lastPublishedDate":"2020-12-08T15:55:02.374252Z"
     },
     "status":"completed",
     "type":"publication"
  },
  "properties":[

  ],
  "canPublish":true,
  "locked":false
}



const rejectedDataset = {
  "content": {
    "id": "N:dataset:378c8bc9-406b-4e6a-832d-2fd36123b6b9",
    "name": "Cameron's Unpublished Dataset",
    "description": "test",
    "state": "READY",
    "createdAt": "2020-04-22T16:49:34.313575Z",
    "updatedAt": "2020-06-08T18:32:54.216996Z",
    "packageType": "DataSet",
    "datasetType": "research",
    "status": "NO_STATUS",
    "automaticallyProcessPackages": false,
    "license": "Community Data License Agreement – Permissive",
    "tags": ["test"],
    "intId": 958
  },
  "organization": "N:organization:050fae39-4412-43ef-a514-703ed8e299d5",
  "owner": "N:user:0a14a358-bd5e-48de-98ec-2ba6557bbde3",
  "collaboratorCounts": { "users": 1, "organizations": 0, "teams": 0 },
  "status": {
    "id": 1,
    "name": "NO_STATUS",
    "displayName": "No Status",
    "color": "#71747C",
    "inUse": true
  },
  "publication": {
    "status": "rejected",
    "type": "publication"
  },
  "properties": [],
  "canPublish": true
}


describe('SubmitDatasetDialog.vue', () => {
  let cmp = {}
  let store = {}
  let state

  beforeEach(() => {
    state = {
      dataset: publishedDataset
    }
    store = new Vuex.Store({
      state
    })
    cmp = mount(SubmitDatasetDialog, {
      store
    })
    cmp.setData({
      selectedDataset: {}
    })
  })

  it('Proper checkboxes are disabled for published dataset', () => {
    cmp.setData({ selectedDataset: publishedDataset })
    expect(cmp.vm.isEmbargoedDisabled).toBe(true)
  })

 it('Proper checkboxes are disabled for embargo dataset', () => {
  cmp.setData({ selectedDataset: embargoedDataset })
  state.dataset = embargoedDataset
  expect(cmp.vm.isEmbargoedDisabled).toBe(true)
})


  it('Proper checkboxes are disabled for rejected, draft dataset', () => {
    cmp.setData({ selectedDataset: rejectedDataset })
    state.dataset = rejectedDataset
    expect(cmp.vm.isEmbargoedDisabled).toBe(false)
  })

  it('Only allows dates that are today or after up to a year', () => {
    const yesterday = moment().subtract(1, 'days')
    expect(cmp.vm.computeIsDisabledDate(yesterday)).toBe(true)

    const oneYearFromNow = moment().add(2, 'years')
    expect(cmp.vm.computeIsDisabledDate(oneYearFromNow)).toBe(true)

    const oneMonthFromNow = moment().add(1, 'months')
    expect(cmp.vm.computeIsDisabledDate(oneMonthFromNow)).toBe(false)
  })

})
