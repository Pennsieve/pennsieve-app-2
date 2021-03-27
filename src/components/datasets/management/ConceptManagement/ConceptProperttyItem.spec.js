import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import ConceptPropertyItem from './ConceptPropertyItem.vue'
import { state, actions, mutations, getters } from '../../../../vuex/store'
import EventBus from '../../../../utils/event-bus'
import flushPromises from 'flush-promises'


describe('ConceptPropertyItem.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      mutations,
      getters,
      actions
    })
    cmp = shallow(ConceptPropertyItem, {
      data: {
        dragged: false,
        dragOver: false,
        dragCounter: 0
      },
      store
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    EventBus.$off()
  })

  it ('dataType(): returns "Number" for a Long datatype of a property', () => {
    const property = {
      conceptTitle: false,
      createdAt: "2018-09-27T15:57:58.016Z",
      dataType: "Long",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Dessert Platter",
      id: "7a240f5a-88c6-4de3-9591-2f731bce0151",
      index: 1,
      name: "dessert_platter",
      required: false
    }
    cmp.setProps({
      property
    })
    expect(cmp.vm.dataType).toEqual('Number')
  })

  it ('dataType(): returns "Decimal" for a Double datatype of a property', () => {
    const property = {
      conceptTitle: false,
      createdAt: "2018-09-27T15:57:58.016Z",
      dataType: "Double",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Dessert Platter",
      id: "7a240f5a-88c6-4de3-9591-2f731bce0151",
      index: 1,
      name: "dessert_platter",
      required: false
    }
    cmp.setProps({
      property
    })
    expect(cmp.vm.dataType).toEqual('Decimal')
  })

  it('isModelTitle(): concept property is a model title', () => {
    const property = {
      conceptTitle: true,
      createdAt: "2018-09-27T15:57:58.016Z",
      dataType: "Double",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Chocolate Strawberries",
      id: "7a240f5a-88c6-4de3-9591-2f731bce0151",
      index: 1,
      name: "chocolate_strawberries",
      required: false
    }
    cmp.setProps({
      property
    })
    expect(cmp.vm.isModelTitle).toBe(true)
  })

  it('isModelTitle(): concept property is not a model title', () => {
    const property = {
      conceptTitle: false,
      createdAt: "2018-09-27T15:57:58.016Z",
      dataType: "Double",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Chocolate Strawberries",
      id: "7a240f5a-88c6-4de3-9591-2f731bce0151",
      index: 1,
      name: "chocolate_strawberries",
      required: false
    }
    cmp.setProps({
      property
    })
    expect(cmp.vm.isModelTitle).toBe(false)
  })

  it ('canArchive(): the property cannot be archived', () => {
    const property = {
      conceptTitle: true,
      createdAt: "2018-09-28T13:30:04.676Z",
      dataType: "Double",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Dessert Platter",
      id: "7a240f5a-88c6-4de3-9591-2f731bce0151",
      index: 1,
      name: "dessert_platter",
      required: false
    }
    cmp.setProps({
      property
    })
    expect(cmp.vm.canArchive).toBe(false)
  })

  // Changed the order of the && statement inside canArchive function
  // because test scenario was failing and kept saying that it was returning a string
  // rather than a boolean value. Computed property still works as expected in the app
  it('canArchive(): the property can be archived', () => {
    const property = {
      conceptTitle: false,
      createdAt: "2018-09-28T13:30:04.676Z",
      dataType: "Double",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Dessert Platter",
      id: "7a240f5a-88c6-4de3-9591-2f731bce0151",
      index: 1,
      name: "dessert_platter",
      required: false
    }
    cmp.setProps({
      property
    })
    expect(cmp.vm.canArchive).toBe(true)
  })

  it('canRemove(): the property can be removed', () => {
    const property = {
      conceptTitle: false,
      createdAt: "",
      dataType: "Double",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Dessert Platter",
      id: "7a240f5a-88c6-4de3-9591-2f731bce0151",
      index: 1,
      name: "dessert_platter",
      required: false
    }
    cmp.setProps({
      property
    })
    expect(cmp.vm.canRemove).toBe(true)
  })

  it('canRemove(): the property cannot be removed', () => {
    const property = {
      conceptTitle: true,
      createdAt: "2018-09-27T15:57:58.016Z",
      dataType: "Double",
      default: false,
      defaultValue: Object,
      description: "",
      displayName: "Dessert Platter",
      id: "7a240f5a-88c6-4de3-9591-2f731bce0151",
      index: 1,
      name: "dessert_platter",
      required: false
    }
    cmp.setProps({
      property
    })
    expect(cmp.vm.canRemove).toBe(false)
  })

  it ('handlePropertyUpdate(): it edits the property for a model', (done) => {
    const cmd = 'edit'
    EventBus.$on('edit-property', () => {
      done()
    })
    cmp.vm.handlePropertyUpdate(cmd)
  })

  it ('handlePropertyUpdate(): it archives the property for a model', (done) => {
    const cmd = 'archive'
    EventBus.$on('archive-property', () => {
      done()
    })
    cmp.vm.handlePropertyUpdate(cmd)
  })

  it ('handlePropertyUpdate(): it removes the property for a model', (done) => {
    const cmd = 'remove'
    EventBus.$on('remove-property', () => {
      done()
    })
    cmp.vm.handlePropertyUpdate(cmd)
  })


  it('onDragStart(): emits dragStart event', (done) => {
    const evt = {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true,
      dataTransfer: {
        setData: () => {}
      }
    }

    cmp.vm.$on('dragstart', () => {
      done()
    })
    cmp.vm.onDragStart(evt)
    expect(cmp.vm.dragged).toBe(true)
  })

  it.skip('onDragEnd(): emits dragEnd event', (done) => {
    const evt = {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true
    }
    cmp.vm.$on('dragend', () => {
      done()
    })
    cmp.vm.onDragEnd(evt)
    expect(cmp.vm.dragged).toBe(false)
  })

  it('onDragEnter(): adds dragCounter and sets the dragOver state for styling', () => {
    cmp.vm.onDragEnter()
    expect(cmp.vm.dragCounter).toEqual(1)
    expect(cmp.vm.dragOver).toBe(true)
  })

  it('onDragLeave(): remove dragOver and set dragOver state for styling', () => {
    const evt = {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true
    }
    cmp.vm.onDragLeave()
    expect(cmp.vm.dragCounter).toEqual(-1)
    expect(cmp.vm.dragOver).toBe(false)
  })

  it('onDragOver(): allows dragging of concept property item', () => {
    const Event = {
      dataTransfer: {
        dropEffect: "move",
        effectAllowed: "all"
      },
      preventDefault: jest.fn(() => {})
    }

    cmp.vm.onDragOver(Event)
    expect(Event.preventDefault).toBeCalled()
    expect(Event.dataTransfer.dropEffect).toEqual("move")
  })

  it('onDrop(): resets dragging state', (done) => {
    const evt = {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelBubble: false,
      cancelable: true
    }
    cmp.vm.$on('drop', () => {
      done()
    })
    cmp.vm.onDrop(evt)
    expect(cmp.vm.dragOver).toBe(false)
    expect(cmp.vm.dragCounter).toEqual(0)
  })
})
