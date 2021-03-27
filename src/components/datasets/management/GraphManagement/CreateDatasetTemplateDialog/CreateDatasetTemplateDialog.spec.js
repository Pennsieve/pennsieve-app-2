
import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import CreateDatasetTemplateDialog from './CreateDatasetTemplateDialog.vue'
import { state, actions, mutations, getters } from '../../../../../vuex/store'

const $router = {
  replace: jest.fn(() => {})
}

const $route = {
  name: 'graph-management',
  params:{
    orgId: 'N:organization:c905919f-56f5-43ae-9c2a-8d5d542c133b',
    datasetId: 'N:dataset:da550e12-1023-4306-9ced-d4b27f46d019'
  }
}

describe('CreateDatasetTemplateDialog.vue', () => {
  let cmp
  let store

  const concept = {
    name: "Person",
    displayName: "person"
  }

  beforeEach(() => {
    store = new Vuex.Store({
      state: Object.assign({}, state, { concepts: [concept]}),
      mutations,
      getters,
      actions
    })

    cmp = mount(CreateDatasetTemplateDialog, {
      attachToDocument: true,
      mocks: {
        $route,
        $router
      },
      store
    })
    cmp.setData({
      step: 1
    })
    cmp.update()
  })

  it ('closeDialog(): close dialog resets component', () => {
    cmp.setProps({
      visible: true
    })

    cmp.setData({
      step: 2,
      form: {
        name: 'DKH Template',
        description: 'Testing the Description'
      }
    })

    cmp.vm.$refs.createDatasetTemplateForm.resetFields = jest.fn(() => {})
    cmp.vm.closeDialog()

    expect(cmp.vm.$refs.createDatasetTemplateForm.resetFields).toBeCalled()
    expect(cmp.vm.step).toEqual(1)
  })
})