import CopyConceptId from './CopyConceptId.vue'
import { shallow } from 'vue-test-utils'

describe('CopyConceptId.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(CopyConceptId)
    cmp.setProps({
      conceptId: 'abc-123'
    })
  })

  it('copyId()', () => {
    cmp.vm.$clipboard = jest.fn(() => {})
    const spy = jest.spyOn(cmp.vm, 'displayMessage')
    cmp.vm.copyId()
    expect(cmp.vm.$clipboard).toBeCalled()
    expect(spy).toBeCalled()
  })

  it('displayMessage()', (done) => {
    cmp.vm.displayMessage()
    expect(cmp.vm.visibility).toBe(true)
    setTimeout(() => {
      expect(cmp.vm.visibility).toBe(false)
      done()
    }, 2250)
  })
})
