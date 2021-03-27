import CollaboratorLabel from './CollaboratorLabel.vue'
import { shallow } from 'vue-test-utils'

describe('CollaboratorLabel.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(CollaboratorLabel)
  })

  it('isTeam: true', () => {
    const item = {
      team: {
        id: 123,
        name: 'Blackfynn'
      }
    }
    cmp.setProps({
      item
    })
    cmp.update()
    expect(cmp.vm.isTeam).toBe(true)
  })

  it('isTeam: false', () => {
    const item = {}
    cmp.setProps({
      item
    })
    cmp.update()
    expect(cmp.vm.isTeam).toBe(false)
  })

})
