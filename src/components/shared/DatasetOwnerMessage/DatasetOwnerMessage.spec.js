import DatasetOwnerMessage from './DatasetOwnerMessage.vue'
import { mount } from 'vue-test-utils'

describe('DatasetOwnerMessage.vue', () => {
  let cmp
  let cmpEmpty

  beforeEach(() => {
    cmp = mount(DatasetOwnerMessage, {
      propsData: {
        title: 'Blackfynn',
        displayOwnerMessage: true
      },
      slots: {
        copy: '<p>Some test copy</p>',
        button: '<button>Learn More</button>',
      },
      attachToDocument: true
    })
    cmpEmpty = mount(DatasetOwnerMessage)
  })

  it('Has slots', () => {
    expect(cmp.vm.title.length).not.toBe(0)
    expect(cmp.vm.$slots.copy).not.toBe(undefined)
    expect(cmp.vm.$slots.button).not.toBe(undefined)
    expect(cmp.vm.displayOwnerMessage).toBe(true)
  })

  it('Does not have slots', () => {
    expect(cmpEmpty.vm.title.length).toBe(0)
    expect(cmpEmpty.vm.$slots.copy).toBe(undefined)
    expect(cmpEmpty.vm.$slots.button).toBe(undefined)
  })

  it('Emits custom got-it event', (done) => {
    cmp.vm.$on('got-it', () => {
      done()
    })
    cmp.vm.gotIt({
      preventDefault: () => {}
    })
  })
})
