import BfUploadFile from './bf-upload-file.vue'
import { mount } from 'vue-test-utils'

describe('bf-upload-file.vue', () => {
  let item = {
    fileName: '@ ! _ %20foo.png',
    escapedFileName: '%40 ! _ %2520foo.png',
    uploadId: 0,
    groupId: '123ABC',
    size: 100,
    uploading: false,
    complete: true
  }

  let cmp = mount(BfUploadFile, {
    propsData: {
      item,
      submitted: true
    }
  })

  it('Computed properties set', () => {
    cmp.setProps({ item: item })
    expect(cmp.vm.uploading).not.toBeTruthy
    expect(cmp.vm.complete).toBeTruthy
    expect(cmp.vm.waiting).not.toBeTruthy
  })

  it('Expected DOM exists', () => {
    expect(cmp.find('.icon-complete').exists()).toBe(true)
    expect(cmp.find('.icon-waiting').exists()).toBe(false)
    expect(cmp.find('bf-progress-bar').exists()).toBe(false)
  })

  it('Shows the proper display name', () => {
    expect(cmp.vm.displayName).toBe('@ ! _  foo.png')
  })
})
