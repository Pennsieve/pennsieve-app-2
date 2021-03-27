import BfDialog from './bf-dialog.vue'
import { shallow } from 'vue-test-utils'

describe('bf-dialog.vue', () => {

  const cmp = shallow(BfDialog, {
    slots: {
      footer: '<div class="dialog-footer" />'
    }
  })

  const cmpEmpty = shallow(BfDialog)

  it('Has footer slot', () => {
    expect(cmp.vm.hasFooterSlot).toBe(true)
  })

  it('No footer slot', () => {
    expect(cmpEmpty.vm.hasFooterSlot).toBe(false)
  })

  it('overlay click: close and overlay-click event emits', (done) => {
    cmp.vm.onOverlayClick();
    expect(cmp.emitted('close')).toBeTruthy()
    expect(cmp.emitted('overlay-click')).toBeTruthy()
    done()
  })
})
