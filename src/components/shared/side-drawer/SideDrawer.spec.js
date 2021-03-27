import SideDrawer from './SideDrawer.vue'
import { mount } from 'vue-test-utils'

describe('SideDrawer.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = mount(SideDrawer, {
      attachToDocument: true
    })
  })

  it('close', (done) => {
    const evt = {
      preventDefault: () => {}
    }
    const spy = jest.spyOn(evt, 'preventDefault')
    cmp.vm.$on('close-side-drawer', () => {
      expect(spy).toBeCalled()
      done()
    })
    cmp.vm.close(evt)
  })
})