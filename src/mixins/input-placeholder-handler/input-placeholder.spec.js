import Vue from 'vue'
import { shallow } from 'vue-test-utils'

import inputPlaceholder from './'

describe('input-placeholder Mixin', () => {
  let cmp

  beforeEach(() => {
    const TestComponent = Vue.component('test', {
      mixins: [
        inputPlaceholder
      ],
      data() {
        return {
          placeholder: ''
        }
      }
    })
    cmp = shallow(TestComponent)
  })

  it('updatePlaceholder: input value length greater than zero', (done) => {
    cmp.vm.updatePlaceholder('123', 'Enter some numbers')
    setTimeout(() => {
      expect(cmp.vm.placeholder).toBe('')
      done()
    }, 250)
  })

  it('updatePlaceholder: input value length equals zero', (done) => {
    cmp.vm.updatePlaceholder('', 'Enter some numbers')
    setTimeout(() => {
      expect(cmp.vm.placeholder).toBe('Enter some numbers')
      done()
    }, 250)
  })
})