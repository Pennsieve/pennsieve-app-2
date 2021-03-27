import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import Models from './Models.vue'
import { state, actions, mutations, getters } from '../../../../vuex/store'
import EventBus from '../../../../utils/event-bus'
import flushPromises from 'flush-promises'

const $route = {
  name: 'Models',
  params:{
    orgId: 'N:organization:c905919f-56f5-43ae-9c2a-8d5d542c133b',
    datasetId: 'N:dataset:da550e12-1023-4306-9ced-d4b27f46d019'
  }
}

describe('Models.vue', () => {
  let cmp
  let cmpNoState
  let store

  const activeOrganization = {organization: {intId: '1', name: 'Blackfynn'}}
  const userToken = '123'
  const config = {apiUrl: "https://api.blackfynn.net"}
  const modelTemplates = []
  const storeState = Object.assign({}, state, { activeOrganization, userToken, config })
  beforeEach(() => {
    store = new Vuex.Store({
      state: storeState,
      mutations,
      getters,
      actions
    })
    cmp = shallow(Models, {
      data: {
        archiveDialogVisible: false,
        lockDialogVisible: false,
        createConceptDialogVisible: false,
        activeModel: {
          name: '',
          displayName: ''
        },
      },
      mocks: {
        $route
      },
      store
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    EventBus.$off()
  })

  it('createConcept(): should open the create custom model dialog window', () => {
    cmp.vm.createConcept()
    expect(cmp.vm.createConceptDialogVisible).toEqual(true)
  })

  //TODO: Add these to the BfDatasetList spec file for unit tests once created
  // it('activeOrgId', () => {
  //   expect(cmp.vm.activeOrgId).toBe('1')
  // })

  // it('getModelTemplatesUrl: success', () => {
  //   expect(cmp.vm.getModelTemplatesUrl).not.toBe(undefined)
  // })

  // it('getModelTemplates: success', (done) => {
  //   const spy = jest.spyOn(cmp.vm, 'handleXhrError')
  //   fetch.mockResponse('[{"id": "1", "name": "Patient"}]', {status: 200})
  //   cmp.vm.getModelTemplates()
  //   flushPromises().then(() => {
  //     expect(spy).not.toHaveBeenCalled()
  //     done()
  //   })
  // })

  // it('getModelTemplates: failure', (done) => {
  //   const spy = jest.spyOn(cmp.vm, 'handleXhrError')
  //   fetch.mockResponse('*', {status: 500})
  //   cmp.vm.getModelTemplates()
  //   flushPromises().then(() => {
  //     expect(spy).toHaveBeenCalled()
  //     done()
  //   })
  // })

  it('openLockDialog(): should open the lock dialog window', () => {
    const model = {
      count: 1,
      createdAt: "2018-07-30T13:35:36.439Z",
      createdBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3",
      description: "",
      displayName: "new model",
      icon: null,
      id: "d7dda599-686b-4213-8ade-f17866e8fc9c",
      locked: false,
      name: "new_model",
      propertyCount: 2,
      updatedAt: "2018-07-30T13:35:36.439Z",
      updatedBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3"
    }
    cmp.vm.openLockDialog(model)
    expect(cmp.vm.activeModel).toEqual(model)
    expect(cmp.vm.lockDialogVisible).toEqual(true)
  })

  it('onUnlockConcept(): should unlock a locked concept model', () => {
    const model = {
      count: 1,
      createdAt: "2018-07-30T13:35:36.439Z",
      createdBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3",
      description: "",
      displayName: "new model",
      icon: null,
      id: "d7dda599-686b-4213-8ade-f17866e8fc9c",
      locked: false,
      name: "new_model",
      propertyCount: 2,
      updatedAt: "2018-07-30T13:35:36.439Z",
      updatedBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3"
    }
    const spy = jest.spyOn(cmp.vm, 'setLockModel')
    cmp.vm.onUnlockConcept(model)
    expect(cmp.vm.activeModel).toEqual(model)
    expect(spy).toHaveBeenCalled();
  })

  it('openArchiveDialog(): should open the archive dialog window', () => {
    const model = {
      count: 1,
      createdAt: "2018-07-30T13:35:36.439Z",
      createdBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3",
      description: "",
      displayName: "new model",
      icon: null,
      id: "d7dda599-686b-4213-8ade-f17866e8fc9c",
      locked: false,
      name: "new_model",
      propertyCount: 2,
      updatedAt: "2018-07-30T13:35:36.439Z",
      updatedBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3"
    }
    cmp.vm.openArchiveDialog(model)
    expect(cmp.vm.activeModel).toEqual(model)
    expect(cmp.vm.archiveDialogVisible).toEqual(true)
  })

  it('updateModel(): should update the model based on the changes that were made', () => {
    const response = {
      count: 1,
      createdAt:"2018-07-30T13:35:36.439Z",
      createdBy:"N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3",
      description: "",
      displayName:"new model",
      icon: null,
      id:"d7dda599-686b-4213-8ade-f17866e8fc9c",
      locked: true,
      name: "new_model",
      propertyCount: 2,
      updatedAt: "2018-09-18T18:11:28.236Z",
      updatedBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3"
    }
    const spy = jest.spyOn(cmp.vm, 'updateConcepts')
    cmp.vm.updateModel(response)
    expect(spy).toHaveBeenCalled()
    expect(cmp.vm.activeModel).toEqual({})
  })

  it('modelUrl(): should return the appropriate url for a specific model', () => {
    cmp.vm.activeModel = {
      count: 0,
      createdAt: "2018-09-19T15:22:02.169Z",
      createdBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3",
      description: "",
      displayName: "Fruits",
      icon: null,
      id: "41fcb895-647f-4430-8691-74ed23e5c952",
      locked: false,
      name: "fruits",
      propertyCount: 3,
      updatedAt: "2018-09-19T15:22:02.169Z",
      updatedBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3"
    }
    const expectedUrl = `${cmp.vm.config.conceptsUrl}/datasets/N:dataset:da550e12-1023-4306-9ced-d4b27f46d019/concepts/41fcb895-647f-4430-8691-74ed23e5c952`
    const modelUrl = cmp.vm.modelUrl
    expect(modelUrl).toBe(expectedUrl)
  })

  it('modelUrl(): should return the appropriate url for the graph management page of a dataset', () => {
    cmp.vm.activeModel = {
      count: 0,
      createdAt: "",
      createdBy: "",
      description: "",
      displayName: "",
      icon: null,
      id: "",
      locked: false,
      name: "",
      propertyCount: 0,
      updatedAt: "",
      updatedBy: ""
    }
    const expectedUrl = `${cmp.vm.config.conceptsUrl}/datasets/N:dataset:da550e12-1023-4306-9ced-d4b27f46d019/concepts/`
    const modelUrl = cmp.vm.modelUrl
    expect(modelUrl).toBe(expectedUrl)
  })

  it('setLockModel(): success event emitted on locked model', (done) => {
    const locked = true
    const spy = jest.spyOn(cmp.vm, 'updateModel')
    fetch.mockResponseOnce('', {status: 200})
    cmp.vm.setLockModel(locked)
    flushPromises().then(() => {
      expect(cmp.vm.lockDialogVisible).toEqual(false)
      expect(spy).toBeCalled()
      done()
    })

  })

    it('setLockModel(): success event emitted on unlocked model', (done) => {
      const locked = false
      const spy = jest.spyOn(cmp.vm, 'updateModel')
      fetch.mockResponseOnce('', {status: 200})
      cmp.vm.setLockModel(locked)
      flushPromises().then(() => {
        expect(cmp.vm.lockDialogVisible).toEqual(false)
        expect(spy).toBeCalled()
        done()
    })

  })

    it('setLockModel(): failure', (done) => {
      const locked = true
      fetch.mockRejectOnce(JSON.stringify('', {status: 500}))
      EventBus.$on('ajaxError', () => {
        done()
      })
      cmp.vm.setLockModel(locked)
    })

    it('archiveConcept(): success event emitted to archive a concept', () => {
      const spy = jest.spyOn(cmp.vm, 'updateConcepts')
      fetch.mockResponseOnce('', {status: 200})
      cmp.vm.archiveConcept()
      flushPromises().then(() => {
        expect(spy).toBeCalled()
        expect(cmp.vm.archiveDialogVisible).toEqual(false)
        expect(cmp.vm.activeModel).toEqual({})
        done()
    })
    })

    it ('archiveConcept(): failure', (done) => {
      fetch.mockRejectOnce(JSON.stringify('', {status: 500}))
      EventBus.$on('ajaxError', () => {
        done()
      })
      cmp.vm.archiveConcept()
    })
  })
