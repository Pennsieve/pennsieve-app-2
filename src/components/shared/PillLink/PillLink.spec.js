import PillLink from './PillLink.vue'
import { shallow } from 'vue-test-utils'

describe('PillLink.vue', () => {
  let cmp
  let cmpSuffix
  let cmpEmpty

  beforeEach(() => {
    cmp = shallow(PillLink, {
      slots: {
        default: 'Visits'
      }
    })

    cmpSuffix = shallow(PillLink, {
      slots: {
        default: 'Medications',
        suffix: '22'
      }
    })

    cmpEmpty = shallow(PillLink)
  })

  it('Has slots', () => {
    expect(cmpSuffix.vm.$slots.suffix.length).toBe(1)
    expect(cmpSuffix.vm.$slots.default.length).toBe(1)
  })

  it('Has default slot, no suffix', () => {
    expect(cmp.vm.$slots.suffix).toBe(undefined)
    expect(cmp.vm.$slots.default.length).toBe(1)
  })

  it('Does not have slots', () => {
    expect(cmpEmpty.vm.$slots.suffix).toBe(undefined)
    expect(cmpEmpty.vm.$slots.default).toBe(undefined)
  })
})