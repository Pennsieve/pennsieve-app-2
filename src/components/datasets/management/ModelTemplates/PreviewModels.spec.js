import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import PreviewModels from './PreviewModels.vue'
import EventBus from '../../../../utils/event-bus'
import { mount } from 'vue-test-utils'
import { state, actions, mutations, getters } from '../../../../vuex/store'

const selectedTemplates = [
  {
    id: 1,
    name: 'Model Jawn'
  },
  {
    id: 2,
    name: 'SPARC Model'
  },
  {
    id: 3,
    name: 'Blackfynn Model'
  },
]

const $router = {
  push: jest.fn(() => {})
}

describe('PreviewModels.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    const organizations = [{organization: {id: 1, name: 'Blackfynn'}}]
    const dataset = { intId: 1, name: 'Blackfynn' }
    const storeState = Object.assign({}, state, { organizations, dataset })
    store = new Vuex.Store({
      state: storeState,
      actions,
      mutations,
      getters
    })
    cmp = mount(PreviewModels, {
      attachToDocument: true,
      store,
      mocks: {
        $router
      }
    })
    cmp.setProps({
      selectedTemplates
    })
    cmp.update()
  })

  it('openDrawer', () => {
    cmp.vm.openDrawer()

    expect(cmp.vm.visible).toBe(true)
    expect(cmp.vm.activeTemplates.length).toBe(selectedTemplates.length)

    const checkedLength = cmp.vm.activeTemplates.map(temp => temp.checked).length
    expect(checkedLength).toBe(selectedTemplates.length)
  })

  it('closeSideDrawer', (done) => {
    cmp.vm.$on('clear-selected-templates', done)
    cmp.vm.closeSideDrawer()
    expect(cmp.vm.visible).toBe(false)
  })

  it('addToGraph: success', (done) => {
    fetch.mockResponse('*', {status: 200})
    const drawerSpy = jest.spyOn(cmp.vm, 'closeSideDrawer')
    const pushSpy = jest.spyOn(cmp.vm.$router, 'push')

    cmp.vm.addToGraph()

    flushPromises().then(() => {
      expect(drawerSpy).toHaveBeenCalled()
      expect(pushSpy).toHaveBeenCalled()
      expect(cmp.vm.processing).toBe(false)
      done()
    })
  })

  it('addToGraph: toast', (done) => {
    fetch.mockResponse('*', {status: 201})
    EventBus.$on('toast', () => {
      done()
    })
    cmp.vm.addToGraph()
  })

  it('addToGraph: 400', (done) => {
    fetch.mockResponse('*', {status: 400})
    EventBus.$on('toast', () => {
      done()
    })
    cmp.vm.addToGraph()
  })

  it('addToGraph: 403', (done) => {
    fetch.mockResponse('*', {status: 403})
    EventBus.$on('toast', () => {
      done()
    })
    cmp.vm.addToGraph()
  })

  it('addToGraph: 500', (done) => {
    fetch.mockResponse('*', {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.addToGraph()
  })

  it('handleTemplateChecked', () => {
    cmp.vm.openDrawer()
    cmp.vm.handleTemplateChecked(cmp.vm.activeTemplates[0])
    expect(cmp.vm.activeTemplates[0].checked).toBe(true)
  })

  it('handleTemplateUnChecked', () => {
    const spy = jest.spyOn(cmp.vm, 'checkActiveTemplates')
    cmp.vm.openDrawer()
    cmp.vm.handleTemplateUnChecked(cmp.vm.activeTemplates[1])
    expect(cmp.vm.activeTemplates[1].checked).toBe(false)
    expect(spy).toHaveBeenCalled()
  })

  it('checkActiveTemplates: length > 0', () => {
    cmp.vm.openDrawer()
    cmp.vm.checkActiveTemplates()
    expect(cmp.vm.primaryDisabled).toBe(false)
  })

  it('checkActiveTemplates: length > 0', () => {
    cmp.vm.openDrawer()
    cmp.vm.activeTemplates.forEach(temp => temp.checked = false)
    cmp.vm.checkActiveTemplates()
    expect(cmp.vm.primaryDisabled).toBe(true)
  })

  it('getErrMsg: 400', () => {
    const str = cmp.vm.getErrMsg(400)
    expect(str.length).toBeGreaterThan(1)
  })

  it('getErrMsg: 403', () => {
    const str = cmp.vm.getErrMsg(403)
    expect(str.length).toBeGreaterThan(1)
  })

  it('getErrMsg: 500', () => {
    const str = cmp.vm.getErrMsg(500)
    expect(str.length).toBe(0)
  })
})