import TeamLabel from './TeamLabel.vue'
import { shallow } from 'vue-test-utils'

describe('TeamLabel.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(TeamLabel)
  })

  it('avatarClass: showMembers false', () => {
    cmp.setProps({
      showMembers: false
    })
    expect(cmp.vm.avatarClass).toBe('team-avatar condensed')
  })

  it('avatarClass: showMembers true', () => {
    cmp.setProps({
      showMembers: true
    })
    expect(cmp.vm.avatarClass).toBe('team-avatar')
  })

  it('createTeamId: valid Id', () => {
    const team = {
      team: {
        id: 123
      }
    }
    expect(cmp.vm.createTeamId(team)).toBe(123)
  })

  it('createTeamId: default Id', () => {
    const team = {}
    expect(cmp.vm.createTeamId(team)).toBe('N:team:0')
  })
})
