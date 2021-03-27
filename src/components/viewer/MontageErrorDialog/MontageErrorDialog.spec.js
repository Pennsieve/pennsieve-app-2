import MontageErrorDialog from './MontageErrorDialog.vue'
import { shallow } from 'vue-test-utils'

describe('MontageErrorDialog.vue', () => {
  const cmp = shallow(MontageErrorDialog)

  it('emits close event when onClose is called', (done) => {
    cmp.vm.onClose()
    expect(cmp.emitted('close')).toBeTruthy()
    done()
  })
})
