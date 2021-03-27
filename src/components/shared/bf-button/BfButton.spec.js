import BfButton from './BfButton.vue'
import { shallow } from 'vue-test-utils'

describe('BfButton.vue', () => {

  const cmp = shallow(BfButton, {
    slots: {
      default: '<div />'
    }
  })

  it('click event emits', (done) => {
    cmp.setProps({
      disabled: false
    })
    cmp.trigger('click')
    expect(cmp.emitted('click')).toBeTruthy()
    done()
  })
})
