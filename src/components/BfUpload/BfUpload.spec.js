global.localStorage = {
  setItem: (key, val) => global.localStorage[key] = val,
  getItem: (key) => global.localStorage[key],
  removeItem: (key) => delete global.localStorage[key]
}

import Vuex, { mapActions } from 'vuex'
import { mount } from 'vue-test-utils'
import BfUpload from './BfUpload.vue'
import { state, actions, mutations, getters } from '../../vuex/store'

describe('BfUpload.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(BfUpload, {
      store
    })
    cmp.setMethods({
      triggerInputFile: jest.fn(() => {})
    })
    cmp.update()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('hasItems()', () => {
    const someItems = cmp.vm.hasItems([1,2,3])
    expect(someItems).toEqual(true)

    const noItems = cmp.vm.hasItems([])
    expect(noItems).toEqual(false)

    const badInput = cmp.vm.hasItems(null)
    expect(badInput).toEqual(false)
  })

  it('setIsDragging()', () => {
    cmp.vm.isAddingFiles = false
    cmp.vm.setIsDragging(true)
    expect(cmp.vm.isDragging).toEqual(false)

    cmp.vm.isAddingFiles = true
    cmp.vm.setIsDragging(true)
    expect(cmp.vm.isDragging).toEqual(true)
  })

  it('dismissInfo()', () => {
    cmp.vm.dismissInfo()
    expect(cmp.vm.showInfo).toEqual(false)
    expect(localStorage.getItem('seen-upload-info')).toEqual(true)
  })

  it('cancelQueue', () => {
    cmp.vm.cancelQueue()
    expect(cmp.vm.fileList.length).toEqual(0)
    expect(cmp.vm.packageList.length).toEqual(0)
    expect(cmp.vm.errorPreflight).toEqual('')
    expect(cmp.vm.isOpen).toEqual(false)
    expect(cmp.vm.errorPreflight).toEqual('')
    expect(cmp.vm.showInfo).toEqual(false)
    expect(cmp.vm.isAddingFiles).toEqual(true)
  })

  it('onOverlayClick()', () => {
    const closeSpy = jest.spyOn(cmp.vm, 'onClose')
    cmp.vm.isAddingFiles = false
    cmp.vm.onOverlayClick()
    expect(closeSpy).toBeCalled()

    const cancelSpy = jest.spyOn(cmp.vm, 'cancelQueue')
    cmp.vm.isAddingFiles = true
    cmp.vm.onOverlayClick()
    expect(cancelSpy).toBeCalled()
  })

  it('onInputFileChange() no files', () => {
    cmp.vm.$refs.inputFile.value = 'abc'
    cmp.vm.onInputFileChange({
      target: {},
      dataTransfer: {}
    })
    expect(cmp.vm.$refs.inputFile.value).toEqual('abc')
  })

  it('onInputFileChange() target files', () => {
    cmp.vm.$refs.inputFile.value = 'abc'

    cmp.vm.onInputFileChange({
      target: {
        files: [
          { name: '1' },
          { name: '2' }
        ]
      },
      dataTransfer: {}
    })
    expect(cmp.vm.droppedFiles.length).toEqual(0)
    expect(cmp.vm.$refs.inputFile.value).toEqual('')
  })

  it('onInputFileChange() dataTransfer files', () => {
    cmp.vm.$refs.inputFile.value = 'abc'

    cmp.vm.onInputFileChange({
      target: {},
      dataTransfer: {
        files: [
          { name: '1' },
          { name: '2' }
        ]
      }
    })
    expect(cmp.vm.droppedFiles.length).toEqual(0)
    expect(cmp.vm.$refs.inputFile.value).toEqual('')
  })

  it('onDrop() not adding files', () => {
    cmp.vm.droppedFiles = [1,2,3]
    cmp.vm.isAddingFiles = false
    cmp.vm.onDrop({})
    expect(cmp.vm.droppedFiles.length).not.toEqual(0)
  })

  it('clearUploadedFiles()', () => {
    cmp.vm.packageList = [
      { isUploaded: true, package: {} },
      { isUploaded: true, package: {} }
    ]
    cmp.vm.uploadList = [
      { isUploaded: true, package: {} },
      { isUploaded: false, package: {} }
    ]
    cmp.vm.clearUploadedFiles()
    expect(cmp.vm.packageList.length).toEqual(0)
    expect(cmp.vm.uploadList.length).toEqual(1)
  })
})
