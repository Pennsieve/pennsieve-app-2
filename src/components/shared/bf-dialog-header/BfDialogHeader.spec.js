import BfDialogHeaderTestComponent from './BfDialogHeaderTestComponent.vue'
import { mount } from 'vue-test-utils'

describe('BfDialogHeader.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = mount(BfDialogHeaderTestComponent, {
      methods: {
        handleClose: () => {}
      }
    })
  })

  it('Parent handles close event', () => {
    const spy = jest.spyOn(cmp.vm, 'handleClose')
    cmp.vm.$children[0].onClose()
    expect(spy).toBeCalled()
  })

})
