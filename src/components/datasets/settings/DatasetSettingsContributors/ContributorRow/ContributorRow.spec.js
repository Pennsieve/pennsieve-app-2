import Vuex from 'vuex'
import ContributorRow from './ContributorRow.vue'
import { state, getters } from '@/vuex/store'
import { mount } from 'vue-test-utils'

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

const orgMembers = [
  {
    "id": "N:user:0a14a358-bd5e-48de-98ec-2ba6557bbde3",
    "email": "cameron@blackfynn.com",
    "firstName": "Cameron",
    "middleInitial": "A",
    "lastName": "Baney",
    "degree": "D.O.",
    "credential": "Front-end Engineer",
    "color": "#B74F6F",
    "url": "",
    "authyId": 0,
    "isSuperAdmin": false,
    "createdAt": "2019-10-31T16:43:44.219502Z",
    "updatedAt": "2020-07-20T21:29:36.959385Z",
    "preferredOrganization": "N:organization:050fae39-4412-43ef-a514-703ed8e299d5",
    "orcid": { "name": "Cameron", "orcid": "0000-0002-8343-7296" },
    "pennsieveTermsOfService": { "version": "20181010000000" },
    "customTermsOfService": [],
    "intId": 28
  }
]

describe('ContributorRow.vue', () => {
  let cmp = {}
  let store = {}

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        ...state,
        orgMembers,
        dataset
      },
      getters
    })
    cmp = mount(ContributorRow, {
      store
    })
  })

  it('The contributor is a dataset owner', () => {
    cmp.setProps({
      contributor: {
        "id": 5,
        "firstName": "Joost",
        "lastName": "Wagenaar",
        "email": "joost@blackfynn.com",
        "orcid": "",
        "userId": 28
      }
    })
    expect(cmp.vm.isDatasetOwner).toBe(true)
  })

  it('The contributor is not a dataset owner', () => {
    cmp.setProps({
      contributor: {
        "id": 5,
        "firstName": "Joost",
        "lastName": "Wagenaar",
        "email": "joost@blackfynn.com",
        "orcid": "",
        "userId": 0
      }
    })
    expect(cmp.vm.isDatasetOwner).toBe(false)
  })

  it('The external contributor is not a dataset owner', () => {
    cmp.setProps({
      contributor: {
        "id": 5,
        "firstName": "Joost",
        "lastName": "Wagenaar",
        "email": "joost@blackfynn.com",
        "orcid": ""
      }
    })
    expect(cmp.vm.isDatasetOwner).toBe(false)
  })
})
