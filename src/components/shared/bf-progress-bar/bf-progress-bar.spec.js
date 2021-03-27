import BfProgressBar from './bf-progress-bar.vue'
import { shallow } from 'vue-test-utils'

describe('bf-progress-bar.vue', () => {

  let cmp;

  beforeEach(() => {
    cmp = shallow(BfProgressBar)
  })

  it('Computes progress', () => {
    cmp.setProps({
      loaded: 50,
      total: 100
    })
    expect(cmp.vm.progress).toEqual(50)
  })
})
