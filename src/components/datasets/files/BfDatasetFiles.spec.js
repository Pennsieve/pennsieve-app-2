import Vuex, { mapActions } from 'vuex'
import { shallow } from 'vue-test-utils'
import BfDatasetFiles from './BfDatasetFiles.vue'
import { state, actions, mutations, getters } from '../../../vuex/store'

describe('bf-dataset-files.vue', () => {
  let cmp
  let store
  let $route

  const evt = {
    packageDTO: {
      children: [],
      content: {
        createdAt: '2018-05-22T13:26:43.097679Z',
        datasetId: 'N:dataset:8c02e00f-1b77-4f84-9e89-664443da13bb',
        id: 'N:package:c0c7248f-59da-4f09-888c-fdb8eed1750c',
        name: 'Baker',
        packageType: 'PDF',
        state: 'READY',
        updatedAt: '2018-06-17T13:26:43.097679Z'
      },
      icon: 'PDF',
      properties: [],
      storage: 32430,
      subtype: 'PDF'
    },
    uploadDestination: {
      id: 'N:dataset:8c02e00f-1b77-4f84-9e89-664443da13bb'
    }
  }

  beforeEach(() => {
    $route = {
      params: {
        datasetId: 'N:dataset:8c02e00f-1b77-4f84-9e89-664443da13bb',
        fileId: ''
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(BfDatasetFiles, {
      data: {
        files: [
          {
            children: [],
            content: {
              createdAt: '2018-06-11T13:26:43.097679Z',
              datasetId: 'N:dataset:8c02e00f-1b77-4f84-9e89-664443da13bb',
              id: 'N:package:77c88edb-b881-4b18-a5df-b1d49f155095',
              name: 'settings',
              packageType: 'Image',
              state: 'READY',
              updatedAt: '2018-07-16T19:22:34.418883Z'
            },
            icon: 'XML',
            properties: [],
            storage: 71182,
            subtype: 'XML'
          }
        ],
        sortBy: 'content.name',
        sortDirection: 'asc'
      },
      mocks: {
        $route
      },
      store
    })
    cmp.update()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('resetSelectedFiles()', () => {
    cmp.vm.selectedFiles = [{ content: {} }]
    cmp.vm.lastSelectedFile = { content: {} }

    cmp.vm.resetSelectedFiles()

    expect(cmp.vm.selectedFiles.length).toEqual(0)
    expect(cmp.vm.lastSelectedFile).toEqual({})
  })

  it('onAddUploadedFile() - Update files list', () => {
    cmp.vm.onAddUploadedFile(evt)
    expect(cmp.vm.files.length).toEqual(1)
  })
})
