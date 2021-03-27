import BfFooter from './BfFooter.vue'
import { shallow } from 'vue-test-utils'

describe('bf-footer.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(BfFooter)
  })

  it('Computes the year', () => {
    const yr = new Date().getFullYear()
    expect(cmp.vm.copyrightYear).toBe(yr)
  })
})
