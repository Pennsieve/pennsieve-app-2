import Vuex from 'vuex'
import ModelTemplates from './ModelTemplates.vue'
import { mount } from 'vue-test-utils'
import { state, actions, mutations, getters } from '../../../../vuex/store'
import flushPromises from 'flush-promises'

describe('ModelTemplates.vue', () => {
  let cmp
  let cmpNoState
  let store

  beforeEach(() => {
    const activeOrganization = {organization: {intId: '1', name: 'Blackfynn'}}
    const userToken = '123'
    const modelTemplates = [{
      $id: 'https://api.blackfynn.net/model-schema/organizations/5/templates/67faf032-4237-4cac-933d-3f0904c5190c',
      $schema: 'http://schema.blackfynn.io/model/draft-01/schema',
      category: 'Acquisition',
      description: 'Description here',
      displayName: 'Acquisition 4',
      icon: null,
      isDisabled: false,
      name: 'acquisition_v4',
      properties: {},
      required: []
    },
    {
      $id: 'https://api.blackfynn.net/model-schema/organizations/5/templates/67faf032-4237-4cac-933d-3f0904c5190c',
      $schema: 'http://schema.blackfynn.io/model/draft-01/schema',
      category: 'Another Test Template',
      description: 'Description here',
      displayName: 'Test',
      icon: null,
      isDisabled: false,
      name: 'test template_v4',
      properties: {},
      required: []
    }]
    const concepts = [{id: 1, name: 'Patient', disabled: false}]
    const storeState = Object.assign({}, state, { activeOrganization, userToken, concepts, modelTemplates })
    store = new Vuex.Store({
      state: storeState,
      actions,
      mutations,
      getters
    })
    cmp = mount(ModelTemplates, {
      attachToDocument: true,
      store
    })
    cmpNoState = mount(ModelTemplates, {
      attachToDocument: true,
      store: new Vuex.Store({
        state: {},
        actions,
        mutations,
        getters
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getModelTemplates: returns model templates', () => {
    const modelTemplates = [{
      $id: 'https://api.blackfynn.net/model-schema/organizations/5/templates/67faf032-4237-4cac-933d-3f0904c5190c',
      $schema: 'http://schema.blackfynn.io/model/draft-01/schema',
      category: 'Acquisition',
      description: 'Description here',
      displayName: 'Acquisition 4',
      icon: null,
      isDisabled: false,
      name: 'acquisition_v4',
      properties: {},
      required: []
    },
    {
      $id: 'https://api.blackfynn.net/model-schema/organizations/5/templates/67faf032-4237-4cac-933d-3f0904c5190c',
      $schema: 'http://schema.blackfynn.io/model/draft-01/schema',
      category: 'Another Test Template',
      description: 'Description here',
      displayName: 'Test',
      icon: null,
      isDisabled: false,
      name: 'test template_v4',
      properties: {},
      required: []
    }]
    expect(cmp.vm.getModelTemplates).toEqual(modelTemplates)
  })

  it('previewSelectedModels', () => {
    const spy = jest.spyOn(cmp.vm.$refs.previewDrawer, 'openDrawer')
    cmp.vm.previewSelectedModels()
    expect(spy).toHaveBeenCalled()
  })

  it('Adds to selectedModels', () => {
    const item = {
      $id: 1,
      name: 'Test'
    }
    cmp.vm.addToSelectedModels(item)
    expect(cmp.vm.selectedModels.length).toBe(1)
  })

  it('Removes from selectedModels', () => {
    const item = {
      $id: 1,
      name: 'Test'
    }
    cmp.vm.removeFromSelectedModels(item)
    expect(cmp.vm.selectedModels.length).toBe(0)
  })

  it('handleClearSelectedTemplates', () => {
    cmp.vm.handleClearSelectedTemplates()
    expect(cmp.vm.selectedModels.length).toBe(0)
  })

  it('isChecked: true', () => {
    cmp.vm.selectedModels = [{$id: 1}]
    const isTrue = cmp.vm.isChecked(1)
    expect(isTrue).toBeTruthy()
  })

  it('isChecked: false', () => {
    cmp.vm.selectedModels = [{$id: 2}]
    const isTrue = cmp.vm.isChecked(1)
    expect(isTrue).not.toBeTruthy()
  })

  it('displayPropertyCount', () => {
    const model = {
      properties: {
        prop1: {id: 1},
        prop2: {id: 2},
        prop3: {id: 3},
        prop4: {id: 4}
      }
    }
    const count = cmp.vm.displayPropertyCount(model)
    expect(count).toBe(4)
  })

  it('displayPropsText: plural', () => {
    const model = {
      properties: {
        prop1: {id: 1},
        prop2: {id: 2},
        prop3: {id: 3},
        prop4: {id: 4}
      }
    }
    const count = cmp.vm.displayPropsText(model)
    expect(count).toBe('Properties')
  })

  it('displayPropsText: singular', () => {
    const model = {
      properties: {
        prop1: {id: 1}
      }
    }
    const count = cmp.vm.displayPropsText(model)
    expect(count).toBe('Property')
  })
})
