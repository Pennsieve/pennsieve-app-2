import { mount } from 'vue-test-utils'

import BfPage from './BfPage.vue'
import EventBus from '../../../utils/event-bus'


describe('BfPage.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = mount(BfPage, {
      attachToDocument: true
    })
  })

  it('Supports stage-scroll custom event', (done) => {
    EventBus.$on('stage-scroll', () => {
      done()
    })
    EventBus.$emit('stage-scroll')
  })

  it('onScroll: scrollTop 0', () => {
    const evt = {
      target: {
        scrollTop: 0
      }
    }
    cmp.vm.onScroll(evt)
    expect(cmp.vm.condensed).toBe(false)
  })

  it('onScroll: scrollTop 100', () => {
    const evt = {
      target: {
        scrollTop: 100
      }
    }
    cmp.vm.onScroll(evt)
    expect(cmp.vm.condensed).toBe(true)
  })
})