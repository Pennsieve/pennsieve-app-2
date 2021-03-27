import Vue from 'vue'
import { shallow } from 'vue-test-utils'

import EncodeInternalFields from './'

describe('EncodeInternalFields Mixin', () => {

  let cmp

  beforeEach(() => {
    const TestComponent = Vue.component('test', {
      mixins: [
        EncodeInternalFields
      ]
    })
    cmp = shallow(TestComponent)
  })

  it('prefixField: adds encoded prefix', () => {
    const field = cmp.vm.prefixField('createdAt')
    expect(field).toBe('%24createdAt')
  })

  it('prefixField: adds prefix', () => {
    const field = cmp.vm.prefixField('createdAt', false)
    expect(field).toBe('$createdAt')
  })

  it('prefixField: no prefix', () => {
    const field = cmp.vm.prefixField('myField')
    expect(field).toBe('myField')
  })
})