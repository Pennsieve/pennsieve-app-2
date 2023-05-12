import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import ConceptManagement from './ConceptManagement.vue'
import { state, actions, mutations, getters } from '../../../../vuex/store'
import EventBus from '../../../../utils/event-bus'
import flushPromises from 'flush-promises'

const $route = {
  name: 'models',
  params:{
    orgId: 'N:organization:c905919f-56f5-43ae-9c2a-8d5d542c133b',
    datasetId: 'N:dataset:d356b163-b316-424a-a74b-cfeb95195006',
    conceptId: '84eeb940-7977-4d27-964a-79327cdfcde3'
  }
}

const $router = {
  push: jest.fn(() => {})
}

describe('ConceptManagement.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    const newState = Object.assign({}, state, {
      concepts: [{
        count: 1,
        createdAt:"2018-07-16T13:58:08.208Z",
        createdBy:"N:user:4edcd1d9-1b25-4860-abdf-79140d069450",
        description:"",
        displayName:"Whiskey",
        icon: null,
        id: "84eeb940-7977-4d27-964a-79327cdfcde3",
        name: "whiskey",
        propertyCount: 4,
        templateId: null,
        updatedAt: "2018-07-16T13:58:08.208Z",
        updatedBy: "N:user:4edcd1d9-1b25-4860-abdf-79140d069450"
      }],
      config: {
        conceptsUrl: 'https://concepts.blackfynn.net'
      },
      dataset: {
        content: {
            intId: 1
        }
      },
      activeOrganization: {
        organization: {
          intId: 1
        }
      },
      userToken: '6f37ad10-987c-4407-8696-027438b76b05'
    })
    store = new Vuex.Store({
      state: newState,
      mutations,
      getters,
      actions
    }),
    cmp = shallow(ConceptManagement, {
      data: {
        properties: [],
        originalProperties: [],
        renameConceptDialogVisible: false,
        archiveDialogVisible: false,
        addEditPropertyDialogVisible: false,
        propertyEdit: {},
        failedPropertyArchive: false,
        savingChanges: false
      },
      mocks: {
        $route,
        $router
      },
      store
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    EventBus.$off()
  })

  it('model(): gets the model from state by id', () => {
    expect(cmp.vm.model.count).toEqual(1)
  })

  it('modelUrl(): should return the model url', () => {
    const url = `${cmp.vm.config.conceptsUrl}/datasets/N:dataset:d356b163-b316-424a-a74b-cfeb95195006/concepts/84eeb940-7977-4d27-964a-79327cdfcde3`
    expect(cmp.vm.modelUrl).toEqual(url)
  })

  it('getModelSchemaUrl(): should return the model schema url', () => {
    const url = `${cmp.vm.config.conceptsUrl}/datasets/N:dataset:d356b163-b316-424a-a74b-cfeb95195006/concepts/84eeb940-7977-4d27-964a-79327cdfcde3/properties`
    expect(cmp.vm.getModelSchemaUrl).toEqual(url)
  })

  it('modelName(): should return the model name', () => {
    expect(cmp.vm.modelName).toEqual(cmp.vm.model.displayName)
  })

  it('modelPropertyCount(): should return the model property count', () => {
    expect(cmp.vm.modelPropertyCount).toEqual(cmp.vm.model.propertyCount)
  })

  it('modelId(): should return the model id', () => {
    expect(cmp.vm.modelId).toEqual(cmp.vm.model.id)
  })

  it('recordCount(): should compute total count of records in model', () => {
    expect(cmp.vm.recordCount).toEqual(cmp.vm.model.count)
  })

  it('updatedDate(): should format model updated date', () => {
    const newDate = 'July 16, 2018'
    expect(cmp.vm.updatedDate).toEqual(newDate)
  })

  it('fetchModelSchema(): should get concept schema', (done) => {
    const respProperty = [{
      conceptTitle: true,
      createdAt: "2018-07-16T13:58:08.629Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Name",
      id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
      index: 0,
      name: "name",
      required: false,
      updatedAt: "2018-08-09T18:48:44.860Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-07-16T13:59:16.743Z",
      dataType: "Long",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Proof",
      id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      index: 1,
      name: "proof",
      required: false,
      updatedAt: "2018-08-09T18:48:44.860Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-07-23T19:46:44.183Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "centroidal_frequency_eyes_close_sway_(hz)",
      id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
      index: 2,
      name: "manufacturer",
      required: false,
      updatedAt: "2018-08-09T18:48:44.860Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Origin",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "origin",
      required: false,
      updatedAt: "2018-08-09T18:48:44.860Z"
    }]
    fetch.mockResponseOnce(JSON.stringify(respProperty), {status: 200})
    cmp.vm.fetchModelSchema()
    flushPromises().then(() => {
      expect(cmp.vm.properties.length).toBeGreaterThan(0)
      done()
    })
  })

  it('fetchModelSchema(): failure', (done) => {
    fetch.mockRejectOnce(JSON.stringify('', {status: 500}))
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.fetchModelSchema()
  })

  it('onMenuSelect(): should select the Rename Model menu item', () => {
    const command = 'rename'
    cmp.vm.onMenuSelect(command)
    expect(cmp.vm.renameConceptDialogVisible).toBe(true)
  })

  it('onMenuSelect(): should select the Archive menu item', () => {
    const command = 'archive'
    const spy = jest.spyOn(cmp.vm, 'openDeleteDialog')
    cmp.vm.onMenuSelect(command)
    expect(spy).toBeCalled()
  })

  it('onMenuSelect(): should select the New Record menu item', () => {
    const command = 'newRecord'
    const spy = jest.spyOn(cmp.vm.$router, 'push')
    cmp.vm.onMenuSelect(command)
    expect(spy).toBeCalled()
  })

  it('openCreateProperty(): should open modal to create new property', () => {
    cmp.vm.openCreateProperty()
    expect(cmp.vm.addEditPropertyDialogVisible).toBe(true)
  })

it('openDeleteDialog(): it opens the delete dialog', () => {
  const property = {
    conceptTitle: false,
    createdAt: "2018-08-09T18:48:44.860Z",
    default: true,
    defaultValue: Object,
    description: "",
    displayName: "Origin",
    id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
    index: 3,
    name: "origin",
    required: false,
    updatedAt: "2018-10-12T20:00:34.199Z",
  }
  cmp.vm.openDeleteDialog(property)
  expect(cmp.vm.deleteDialogVisible).toBe(true)
  expect(cmp.vm.propertyEdit).toEqual(property)
})

it('confirmDeleteDialog(): it confirms that the property was archived', () => {
  cmp.setData({
    propertyEdit: [{
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Origin",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "origin",
      required: false,
      updatedAt: "2018-10-12T20:00:34.199Z",
    },
    {
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "blah",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "origin",
      required: false,
      updatedAt: "2018-10-12T20:00:34.199Z",
    }]
  })
  cmp.update()
  const spy = jest.spyOn(cmp.vm, 'deleteProperty')
  cmp.vm.confirmDeleteDialog()
  expect(spy).toBeCalled()
})

it('confirmDeleteDialog(): it confirms that the concept was archived', () => {
  const spy = jest.spyOn(cmp.vm, 'deleteConcept')
  cmp.vm.confirmDeleteDialog()
  expect(spy).toBeCalled()
})

it('deleteConcept(): success event for archive concept', (done) => {
  const spy = jest.spyOn(cmp.vm.$router, 'push')
  fetch.mockResponseOnce('', {status: 200})
    cmp.vm.deleteConcept()
      flushPromises().then(() => {
        fetch.mockResponseOnce('', {status: 200})
        flushPromises().then(() => {
          expect(cmp.vm.archiveDialogVisible).toBe(false)
          expect(spy).toBeCalled()
          EventBus.$on('toast', () => {
            done()
          })
          done()
        })
    })
})

it('deleteProperty(): success event for archive property', (done) => {
  const msg = 'Origin deleted'
  cmp.vm.deleteProperty()
  fetch.mockResponseOnce('', {status: 200})
  flushPromises().then(() => {
    EventBus.$on('toast', () => {
      done()
    })
    expect(cmp.vm.deleteDialogVisible).toBe(false)
    expect(cmp.vm.propertyEdit).toEqual({})
    done()
  })
})

it('deleteProperty(): failure', () => {
  fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 400})
    EventBus.$on('ajaxError', () => {
      done()
  })
  cmp.vm.deleteProperty()
})

it('onDeleteDialogClose(): should close the archive dialog', () => {
  cmp.vm.onDeleteDialogClose()
  expect(cmp.vm.propertyEdit).toEqual({})
  expect(cmp.vm.failedPropertyArchive).toBe(false)
})

it('onRemoveProperty(): should remove the property from the list', () => {
  const prop = {
    conceptTitle: false,
    createdAt: "2018-08-09T18:48:44.860Z",
    default: true,
    defaultValue: Object,
    description: "",
    displayName: "Origin",
    id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
    index: 3,
    name: "origin",
    required: false,
    updatedAt: "2018-10-12T20:00:34.199Z",
  }
  const updatedProp = [{
    conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "blah",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "blah",
      required: false,
      updatedAt: "2018-10-12T20:00:34.199Z"
  }]
  cmp.setData({
    properties: [{
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Origin",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "origin",
      required: false,
      updatedAt: "2018-10-12T20:00:34.199Z",
    }, {
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "blah",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "blah",
      required: false,
      updatedAt: "2018-10-12T20:00:34.199Z"
    }]
  })
  cmp.update()
  cmp.vm.onRemoveProperty(prop)
  expect(cmp.vm.properties).toEqual(updatedProp)
  expect(cmp.vm.changedProperties).toEqual([])
})

it('openPropertyEditDialog(): should open the edit property dialog', () => {
  const prop = {
    conceptTitle: false,
    createdAt: "2018-08-09T18:48:44.860Z",
    default: true,
    defaultValue: Object,
    description: "",
    displayName: "Origin",
    id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
    index: 3,
    name: "origin",
    required: false,
    updatedAt: "2018-10-12T20:00:34.199Z",
  }
  cmp.vm.openPropertyEditDialog(prop)
  expect(cmp.vm.propertyEdit).toEqual(prop)
  expect(cmp.vm.addEditPropertyDialogVisible).toBe(true)
})

it('checkModelTitle(): new property is model title', () => {
    const property = {
      conceptTitle: true,
      createdAt: "2018-07-16T13:58:08.629Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "New Name",
      id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
      index: 0,
      name: "name",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z",
      value: ""
    }
    cmp.setData({
      changedProperties: ['name']
    })
    cmp.update()
    const updatedChangedProperties = ['name']
    cmp.vm.checkModelTitle(property)
    expect(cmp.vm.changedProperties).toEqual(updatedChangedProperties)
  })

  it('checkModelTitle(): new property is not model title', () => {
    const property = {
      conceptTitle: false,
      createdAt: "2018-07-16T13:59:16.743Z",
      dataType: "Long",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "name",
      id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      index: 1,
      name: "name",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z",
      value: ""
    }
    cmp.setData({
      changedProperties: [
        {
          conceptTitle: true,
          createdAt: "2018-07-16T13:59:16.743Z",
          dataType: "Long",
          default: false,
          defaultValue: Object,
          description: "",
          displayName: "Proof",
          id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
          index: 1,
          name: "proof",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        },
      ]
    })
    cmp.update()
    const changedProperties = [
      {
        conceptTitle: true,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Proof",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "proof",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
    ]
    cmp.vm.checkModelTitle(property)
    expect(cmp.vm.changedProperties).toEqual(changedProperties)
  })

  it('checkModelTitle(): change property to become model title', () => {
    cmp.setData({
      properties: [
      {
        conceptTitle: true,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Proof",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "proof",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-16T13:58:08.629Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "Name",
        id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
        index: 0,
        name: "name",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z",
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-23T19:46:44.183Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "centroidal_frequency_eyes_close_sway_(hz)hj",
        id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
        index: 2,
        name: "manufacturer",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z",
        value: ""
      },
      {
        conceptTitle: false,
        createdAt: "2018-08-09T18:48:44.860Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "Origin",
        id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
        index: 3,
        name: "origin",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      }]
    })
    cmp.update()
    const property = {
      conceptTitle: false,
      createdAt: "2018-07-16T13:59:16.743Z",
      dataType: "Long",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "name",
      id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      index: 1,
      name: "name",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z",
      value: ""
    }
    property.conceptTitle = true
    cmp.vm.checkModelTitle(property)
    expect(cmp.vm.properties[0].conceptTitle).toBe(false)
  })

  it('onEditProperty(): edits a property in a model', () => {
    cmp.setData({
      properties: [{
        conceptTitle: true,
        createdAt: "2018-07-16T13:58:08.629Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "Name",
        id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
        index: 0,
        name: "name",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z",
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Proof",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "proof",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-23T19:46:44.183Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "centroidal_frequency_eyes_close_sway_(hz)hj",
        id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
        index: 2,
        name: "manufacturer",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z",
        value: ""
      },
      {
        conceptTitle: false,
        createdAt: "2018-08-09T18:48:44.860Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "Origin",
        id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
        index: 3,
        name: "origin",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      }]
    })
    cmp.update()
    const newProperties =  [
    {
      "conceptTitle": true,
      "createdAt": "2018-07-16T13:58:08.629Z",
      "dataType": "String",
      "default": true,
      "defaultValue": Object,
      "description": "",
      "displayName": "Name",
      "id": "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
      "index": 0,
      "name": "name",
      "required": false,
      "updatedAt": "2018-10-09T17:47:17.778Z"
    },
    { "conceptTitle": false,
      "createdAt": "2018-07-16T13:59:16.743Z",
      "dataType": "Long",
      "default": false,
      "defaultValue": Object,
      "description": "",
      "displayName": "Proof",
      "id": "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      "index": 1,
      "name": "proof",
      "required": false,
      "updatedAt": "2018-10-09T17:47:17.778Z"
    },
    {
      "conceptTitle": false,
      "createdAt": "2018-07-23T19:46:44.183Z",
      "dataType": "String",
      "default": true,
      "defaultValue": Object,
      "description": "",
      "displayName": "centroidal_frequency_eyes_close_sway_(hz)hj",
      "id": "92fc7812-bcac-4308-a40a-46177c9b21b9",
      "index": 2,
      "name": "manufacturer",
      "required": false,
      "updatedAt": "2018-10-09T17:47:17.778Z",
      "value": ""
      },
      {
        "conceptTitle": false,
        "createdAt": "2018-08-09T18:48:44.860Z",
        "dataType": "String",
        "default": true,
        "defaultValue": Object,
        "description": "",
        "displayName": "Origin",
        "id": "e5fce641-453f-44d3-b270-ec1fee12bea3",
        "index": 3,
        "name": "origin",
        "required": false,
        "updatedAt": "2018-10-09T17:47:17.778Z"
      }
    ]
    const propertyToEdit = {
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Origin",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "origin",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
  }
    const changedProperties = [newProperties[3]]
    cmp.vm.onEditProperty(propertyToEdit)
    expect(cmp.vm.originalProperties).toEqual(cmp.vm.properties)
    expect(cmp.vm.changedProperties).toEqual(changedProperties)
    expect(cmp.vm.properties).toEqual(newProperties)
    expect(cmp.vm.addEditPropertyDialogVisible).toBe(false)
  })

  it('onConfirmLossOfChanges(): resets model when user confirms loss of changes', () => {
    const spy = jest.spyOn(cmp.vm, 'resetModel')
    cmp.vm.onConfirmLossOfChanges()
    expect(spy).toBeCalled()
  })

  it('cancelChanges(): cancels changes to properties in model and resets back to default state', () => {
    const spy = jest.spyOn(cmp.vm, 'resetModel')
    cmp.vm.cancelChanges()
    expect(cmp.vm.properties).toEqual([])
    expect(spy).toBeCalled()
  })

  it('resetModel(): resets model', () => {
    cmp.vm.resetModel()
    expect(cmp.vm.originalProperties).toEqual([])
    expect(cmp.vm.changedProperties).toEqual([])
  })

  it('_onUpdatePropertyOrder(): changes the property order list', () => {
    cmp.setData({
      properties: [
        {
          conceptTitle: true,
          createdAt: "2018-07-16T13:58:08.629Z",
          dataType: "String",
          default: true,
          defaultValue: Object,
          description: "",
          displayName: "Name",
          id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
          index: 0,
          name: "name",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        },
        {
          conceptTitle: false,
          createdAt: "2018-07-16T13:59:16.743Z",
          dataType: "Long",
          default: false,
          defaultValue: Object,
          description: "",
          displayName: "Proof",
          id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
          index: 1,
          name: "proof",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        },
        {
          conceptTitle: false,
          createdAt: "2018-07-23T19:46:44.183Z",
          dataType: "String",
          default: true,
          defaultValue: Object,
          description: "",
          displayName: "centroidal_frequency_eyes_close_sway_(hz)",
          id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
          index: 2,
          name: "manufacturer",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        },
        {
          conceptTitle: false,
          createdAt: "2018-08-09T18:48:44.860Z",
          dataType: "String",
          default: true,
          defaultValue: Object,
          description: "",
          displayName: "Origin",
          id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
          index: 3,
          name: "origin",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        }
      ]
    })
    cmp.update()
    const targetProperty = {
      conceptTitle: false,
      createdAt: "2018-07-23T19:46:44.183Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "centroidal_frequency_eyes_close_sway_(hz)",
      id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
      index: 2,
      name: "manufacturer",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    }
    const selectedProperty = {
      conceptTitle: false,
      createdAt: "2018-07-16T13:59:16.743Z",
      dataType: "Long",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Proof",
      id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      index: 1,
      name: "proof",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    }
    const changedprops = [
      {
        conceptTitle: false,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Proof",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "proof",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      }
    ]
    const newProperties = [
      {
        conceptTitle: true,
        createdAt: "2018-07-16T13:58:08.629Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "Name",
        id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
        index: 0,
        name: "name",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Proof",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "proof",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-23T19:46:44.183Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "centroidal_frequency_eyes_close_sway_(hz)",
        id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
        index: 2,
        name: "manufacturer",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-08-09T18:48:44.860Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "Origin",
        id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
        index: 3,
        name: "origin",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      }
    ]
    cmp.vm._onUpdatePropertyOrder({targetProperty, selectedProperty})
    expect(cmp.vm.changedProperties.length).toEqual(changedprops.length)
  })


  it('onAddProperty(): adds a property to the model', () => {
    const newProp = {
      conceptTitle: false,
      createdAt: "2018-07-16T13:59:16.743Z",
      dataType: "Long",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Maha's Prop",
      id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      index: 1,
      name: "maha's prop",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    }
    const changedProps = [
      {
        conceptTitle: false,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Maha's Prop",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "maha's prop",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      }
    ]
    const oldProps =  [
    {
      "conceptTitle": false,
      "createdAt": "2018-07-16T13:59:16.743Z",
      "dataType": "Long",
      "default": false,
      "defaultValue": Object,
      "description": "",
      "displayName":
      "Proof",
      "id": "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      "index": 1,
      "name": "proof",
      "required": false,
      "updatedAt": "2018-10-09T17:47:17.778Z"
    },
    {
      "conceptTitle": false,
      "createdAt": "2018-07-16T13:59:16.743Z",
      "dataType": "Long",
      "default": false,
      "defaultValue": Object,
      "description": "",
      "displayName":
      "Origin",
      "id": "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      "index": 1,
      "name": "origin",
      "required": false,
      "updatedAt": "2018-10-09T17:47:17.778Z"
    },
    {
      "conceptTitle": false,
      "createdAt": "2018-07-16T13:59:16.743Z",
      "dataType": "Long",
      "default": false,
      "defaultValue": Object,
      "description": "",
      "displayName": "Maha's Prop",
      "id": "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      "index": 1,
      "name": "maha's prop",
      "required": false,
      "updatedAt": "2018-10-09T17:47:17.778Z"
    }]
    cmp.setData({
      properties: [{
        conceptTitle: false,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Proof",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "proof",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Origin",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "origin",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Maha's Prop",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "maha's prop",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      }]
    })
    cmp.update()
    cmp.vm.onAddProperty(newProp)
    expect(cmp.vm.addEditPropertyDialogVisible).toBe(false)
    expect(cmp.vm.changedProperties).toEqual(changedProps)
  })

  it('incrementPropertyCount(): increments the property count for the concept in state', () => {
    const count = 5
    const spy = jest.spyOn(cmp.vm, 'updateConcepts')
    cmp.vm.incrementPropertyCount(count)
    expect(spy).toBeCalled()
  })

  it('hasModelTitle(): a model title exists in list of properties', () => {
    const properties = [
    {
      conceptTitle: true,
      createdAt: "2018-07-16T13:58:08.629Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Name",
      id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
      index: 0,
      name: "name",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-07-16T13:59:16.743Z",
      dataType: "Long",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Proof",
      id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      index: 1,
      name: "proof",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-07-23T19:46:44.183Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "centroidal_frequency_eyes_close_sway_(hz)",
      id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
      index: 2,
      name: "manufacturer",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Origin",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "origin",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    }]
    const result = cmp.vm.hasModelTitle(properties)
    expect(result).toBe(true)
  })

  it('hasModelTitle(): needs to have a property with at least one model title', () => {
    const properties = [
    {
      conceptTitle: false,
      createdAt: "2018-07-16T13:58:08.629Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Name",
      id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
      index: 0,
      name: "name",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-07-16T13:59:16.743Z",
      dataType: "Long",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Proof",
      id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      index: 1,
      name: "proof",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-07-23T19:46:44.183Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "centroidal_frequency_eyes_close_sway_(hz)",
      id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
      index: 2,
      name: "manufacturer",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Origin",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "origin",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    }]
    const result = cmp.vm.hasModelTitle(properties)
    expect(result).toBe(false)
  })

  it('normalizeDisplayName(): normalizes prop display name', () => {
    const originalName = {
      displayName: 'Centroidal Frequency Eyes Close Sway (hz)'
    }
    const normalizedName = 'centroidal frequency eyes close sway (hz)'
    const result = cmp.vm.normalizeDisplayName(originalName)
    expect(result).toEqual(normalizedName)
  })

  it('hasUniqueDisplayNames(): checks that all display names are unique in properties list', () => {
    cmp.setData({
      properties: [
        {
          conceptTitle: false,
          createdAt: "2018-07-16T13:58:08.629Z",
          dataType: "String",
          default: true,
          defaultValue: Object,
          description: "",
          displayName: "Name",
          id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
          index: 0,
          name: "name",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        },
        {
          conceptTitle: false,
          createdAt: "2018-07-16T13:59:16.743Z",
          dataType: "Long",
          default: false,
          defaultValue: Object,
          description: "",
          displayName: "Proof",
          id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
          index: 1,
          name: "proof",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        },
        {
          conceptTitle: false,
          createdAt: "2018-07-23T19:46:44.183Z",
          dataType: "String",
          default: true,
          defaultValue: Object,
          description: "",
          displayName: "centroidal_frequency_eyes_close_sway_(hz)",
          id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
          index: 2,
          name: "manufacturer",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        },
        {
          conceptTitle: false,
          createdAt: "2018-08-09T18:48:44.860Z",
          dataType: "String",
          default: true,
          defaultValue: Object,
          description: "",
          displayName: "Origin",
          id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
          index: 3,
          name: "origin",
          required: false,
          updatedAt: "2018-10-09T17:47:17.778Z"
        }]
      })
      cmp.update()
      const result = cmp.vm.hasUniqueDisplayNames(cmp.vm.properties)
      expect(result).toBe(true)
  })

  it('hasUniqueDisplayNames(): display names are not unique in properties list', () => {
   cmp.setData({
     properties: [{
      conceptTitle: false,
      createdAt: "2018-07-16T13:58:08.629Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Name",
      id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
      index: 0,
      name: "name",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-07-16T13:59:16.743Z",
      dataType: "Long",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Name",
      id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
      index: 1,
      name: "name",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-07-23T19:46:44.183Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "centroidal_frequency_eyes_close_sway_(hz)",
      id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
      index: 2,
      name: "manufacturer",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    },
    {
      conceptTitle: false,
      createdAt: "2018-08-09T18:48:44.860Z",
      dataType: "String",
      default: true,
      defaultValue: Object,
      description: "",
      displayName: "Origin",
      id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
      index: 3,
      name: "origin",
      required: false,
      updatedAt: "2018-10-09T17:47:17.778Z"
    }]
   })
   cmp.update()
   const result = cmp.vm.hasUniqueDisplayNames(cmp.vm.properties)
   expect(result).toBe(false)
  })

  it('validateChanges(): all changes made to properties are valid', () => {
    cmp.setData({
      properties: [{
        conceptTitle: false,
        createdAt: "2018-07-16T13:58:08.629Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "Name",
        id: "706ad2ca-8157-4b8f-ad91-5c6e85bb6b6f",
        index: 0,
        name: "name",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-16T13:59:16.743Z",
        dataType: "Long",
        default: false,
        defaultValue: Object,
        description: "",
        displayName: "Color",
        id: "9c33c91f-1f45-4a82-bc3d-17c415b88764",
        index: 1,
        name: "color",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: false,
        createdAt: "2018-07-23T19:46:44.183Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "centroidal_frequency_eyes_close_sway_(hz)",
        id: "92fc7812-bcac-4308-a40a-46177c9b21b9",
        index: 2,
        name: "manufacturer",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      },
      {
        conceptTitle: true,
        createdAt: "2018-08-09T18:48:44.860Z",
        dataType: "String",
        default: true,
        defaultValue: Object,
        description: "",
        displayName: "Origin",
        id: "e5fce641-453f-44d3-b270-ec1fee12bea3",
        index: 3,
        name: "origin",
        required: false,
        updatedAt: "2018-10-09T17:47:17.778Z"
      }]
    })
    cmp.update()
    const spy = jest.spyOn(cmp.vm, 'saveChanges')
    cmp.vm.validateChanges()
    expect(cmp.vm.savingChanges).toBe(true)
    expect(spy).toBeCalled()
  })

  it('validateChanges(): it must have one modal title', (done) => {
    const msg = 'You must have 1 model title.'
    EventBus.$on('toast', () => {
      {
        'error',
        msg
      }
      done()
    })
    EventBus.$emit('toast')
    cmp.vm.validateChanges()
  })

  it('validateChanges(): it must have unique property display names', (done) => {
    const msg = 'Please be sure all property display names are unique.'
    EventBus.$on('toast', () => {
      {
        'error',
        msg
      }
      done()
    })
    EventBus.$emit('toast')
    cmp.vm.validateChanges()
  })

  it.skip('saveChanges(): success event emitted for property changes', (done) => {
    // @TODO need to re-write
    const spy = jest.spyOn(cmp.vm, 'resetModel')
    const countSpy = jest.spyOn(cmp.vm, 'incrementPropertyCount')
    const msg = 'Whiskey saved'

    fetch.mockResponseOnce('', {status: 200})
    cmp.vm.saveChanges()

    flushPromises().then(() => {
      expect(spy).toBeCalled()
      expect(countSpy).toBeCalled()
      EventBus.$on('toast', () => {
          'success',
          msg
        done()
      })
      EventBus.$emit('toast')
      expect(cmp.vm.savingChanges).toBe(false)
      done()
    })

  })
})
