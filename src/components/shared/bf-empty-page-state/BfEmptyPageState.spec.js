import BfEmptyPageState from './BfEmptyPageState.vue'
import { shallow } from 'vue-test-utils'

describe('bf-dialog.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(BfEmptyPageState, {
      slots: {
        default: '<div class="test">Test</div>'
      }
    })
  })

  it('Has slot', () => {
    cmp.vm.$nextTick(() => {
      const hasTestContent = cmp.find('.test') ? true : false;
      expect(hasTestContent).toBe(true)
    })
  })
})
