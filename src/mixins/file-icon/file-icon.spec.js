import Vue from 'vue'
import { shallow } from 'vue-test-utils'

import FileIcon from './'

describe('FileIcon Mixin', () => {

  let cmp

  beforeEach(() => {
    const TestComponent = Vue.component('test', {
      mixins: [
        FileIcon
      ],
      data() {
        return {
          placeholder: ''
        }
      }
    })
    cmp = shallow(TestComponent)
  })

  it('fileIcon: returns Collection folder icon', () => {
    const collectionIcon = cmp.vm.fileIcon('', 'Collection')
    expect(collectionIcon.indexOf('icon-folder') >= 0).toBe(true)
  })

  it('fileIcon: returns known icon', () => {
    const icon = cmp.vm.fileIcon('Docker', 'dockerfile')
    expect(icon.indexOf('icon-docker') >= 0).toBe(true)
  })

  it('fileIcon: returns default icon', () => {
    const collectionIcon = cmp.vm.fileIcon('', '')
    expect(collectionIcon.indexOf('icon-generic') >= 0).toBe(true)
  })
})