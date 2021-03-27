import Vue from 'vue'
import { shallow } from 'vue-test-utils'

import GetFileProperty from './'

const fileProperties = [
  {
    category: 'Pennsieve',
    properties: [
      {
        dataType: 'string',
        display: 'Image',
        fixed: false,
        hidden: true,
        key: 'subtype',
        value: 'Image'
      },
      {
        dataType: 'string',
        display: 'Image',
        fixed: false,
        hidden: true,
        key: 'icon',
        value: 'Image'
      },
    ]
  },
  {
    category: 'Goldie',
    properties: [
      {
        dataType: 'string',
        display: 'Item',
        fixed: false,
        hidden: true,
        key: 'item',
        value: 'Falafel'
      },
    ]
  }
]

describe('GetFileProperty Mixin', () => {

  let cmp

  beforeEach(() => {
    const TestComponent = Vue.component('test', {
      mixins: [
        GetFileProperty
      ]
    })
    cmp = shallow(TestComponent)
  })

  it('fileIcon: returns a file icon value', () => {
    const icon = cmp.vm.getFilePropertyVal(fileProperties, 'icon')
    expect(icon).toEqual('Image')
  })

  it('subtype: returns a file subtype value', () => {
    const subtype = cmp.vm.getFilePropertyVal(fileProperties, 'subtype')
    expect(subtype).toEqual('Image')
  })

  it('category: allows you to specify a category', () => {
    const item = cmp.vm.getFilePropertyVal(fileProperties, 'item', 'Goldie')
    expect(item).toEqual('Falafel')
  })

  it('property object: returns a property object', () => {
    const item = cmp.vm.getFileProperty(fileProperties, 'item', 'Goldie')
    const expectedResult = {
      dataType: 'string',
      display: 'Item',
      fixed: false,
      hidden: true,
      key: 'item',
      value: 'Falafel'
    }
    expect(item).toEqual(expectedResult)
  })
})