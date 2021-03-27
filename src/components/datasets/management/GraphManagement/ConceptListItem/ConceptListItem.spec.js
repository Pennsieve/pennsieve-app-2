import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import ConceptListItem from './ConceptListItem.vue' // import the right component
import { state, actions, mutations, getters } from '../../../../../vuex/store'
import EventBus from '../../../../../utils/event-bus'

const $router = {
  push: jest.fn(() => {})
}

describe('ConceptListItem.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(ConceptListItem, {
      mocks :{
        $router
      },
      store
    })
    cmp.update()
  })

  afterEach(() => {
    jest.clearAllMocks()
    EventBus.$off()
  })

  it ('onMenuSelect(): should redirect to the concept page when configure is selected', () => {
    const command = 'configure'
    const spy = jest.spyOn(cmp.vm, 'openConcept')
    cmp.vm.onMenuSelect(command)
    expect(spy).toBeCalled()
  })

  it('onMenuSelect(): should archive the model when archive is selected', (done) => {
    const command = 'archive'
    cmp.vm.$on('archive-concept', () => {
      done()
    })
    cmp.vm.onMenuSelect(command)
  })

  it('onMenuSelect(): should create a new record in the model when new record is selected', () => {
    const command = 'newRecord'
    const spy = jest.spyOn(cmp.vm.$router, 'push')
    cmp.vm.onMenuSelect(command)
    expect(spy).toBeCalled()
  })


  it ('modelId(): it returns the concept id', () => {
    const concept = {
      count: 1,
      createdAt: "2018-07-30T13:35:36.439Z",
      createdBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3",
      description: "",
      displayName: "new model",
      icon: null,
      id: "d7dda599-686b-4213-8ade-f17866e8fc9c",
      name: "new_model",
      propertyCount: 2,
      updatedAt: "2018-09-20T18:46:17.904Z",
      updatedBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3"
    }
    cmp.setProps({
      concept
    })
    expect(cmp.vm.modelId).toEqual(concept.id)
  })

  it('modelDisplayName() it returns the concept display name', () => {
    const concept = {
      count: 1,
      createdAt: "2018-07-30T13:35:36.439Z",
      createdBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3",
      description: "",
      displayName: "new model",
      icon: null,
      id: "d7dda599-686b-4213-8ade-f17866e8fc9c",
      name: "new_model",
      propertyCount: 2,
      updatedAt: "2018-09-20T18:46:17.904Z",
      updatedBy: "N:user:5e52cf3b-8bae-4605-aad5-acd4ecbc0ac3"
    }
    cmp.setProps({
      concept
    })
    expect(cmp.vm.modelDisplayName).toEqual(concept.displayName)
  })

  it('openConcept(): should navigate to the concept details page on click', () => {
    const spy = jest.spyOn(cmp.vm.$router, 'push')
    cmp.vm.openConcept()
    expect(spy).toBeCalled()
  })


})
