import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import { actions, mutations, getters } from '../../../vuex/store'
import TeamMembersList from './TeamMembersList.vue'
import EventBus from '../../../utils/event-bus'
import flushPromises from 'flush-promises'

const activeOrg = {
  organization: {
    name: 'Blackfynn',
    id: 777
  },
  administrators: [{id: 1}]
}

const $route = {
  params: {
    id: 17
  }
}

const members = [
  {id: 1, firstName: 'Marcellus', lastName: 'Wallace'},
  {id: 2, firstName: 'Mia', lastName: 'Wallace'},
  {id: 3, firstName: 'Vincent', lastName: 'Vega'}
]

const teamObj = {
  team: {
    id: 17,
    name: 'The Iggles'
  }
}

describe('TeamMembersList.vue', () => {
  let cmp
  let state
  let store

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      profile: {
        id: 1,
        firstName: 'Clarke',
        lastName: 'Kent'
      },
      userToken: '123',
      activeOrganization: {},
      teams: [
        {
          team: {
            id: 17,
            name: 'Eagles'
          },
          memberCount: 59
        },
        {
          team: {
            id: 36,
            name: 'Steelers'
          },
          memberCount: 55
        },
        {
          team: {
            id: 999,
            name: 'Publishers',
            systemTeamType: 'publishers'
          }
        }
      ],
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(TeamMembersList, {
      attachToDocument: true,
      mocks: {
        $route
      },
      store
    })
  })

  afterEach(() => {
    EventBus.$off()
  })

  it('mounted', (done) => {
    const spy = jest.spyOn(cmp.vm, 'getTeam')
    const activeOrg = {
      organization: {
        id: 1,
        name: 'Blackfynn'
      }
    }
    cmp.vm.$store.dispatch('updateActiveOrganization', activeOrg).then(() => {
      expect(spy).toBeCalled()
      done()
    })
  })

  it('onMembersAddedToTeam()', () => {
    cmp.vm.team = teamObj;
    cmp.vm.onMembersAddedToTeam([{id: 7, firstName: 'Vincent', lastName: 'Vega'}])
    expect(cmp.vm.members.length).toBe(1)
  })

  it('handleCommand()', (done) => {
    const deleteSpy = jest.spyOn(cmp.vm, 'openDeleteTeam')
    cmp.vm.handleCommand('delete')
    cmp.vm.$nextTick(() => {
      expect(deleteSpy).toBeCalled()
      done()
    })
  })

  it('handleCommand()', (done) => {
    const editSpy = jest.spyOn(cmp.vm, 'openEditTeam')
    cmp.vm.handleCommand('edit')
    cmp.vm.$nextTick(() => {
      expect(editSpy).toBeCalled()
      done()
    })
  })

  it('handleCommand()', (done) => {
    const deleteSpy = jest.spyOn(cmp.vm, 'openDeleteTeam')
    const editSpy = jest.spyOn(cmp.vm, 'openEditTeam')
    cmp.vm.handleCommand('blah')
    cmp.vm.$nextTick(() => {
      expect(editSpy).not.toBeCalled()
      expect(deleteSpy).not.toBeCalled()
      done()
    })
  })

  it('onTeamMemberRemoved', () => {
    const expectedMembers = [members[1], members[2]]
    const member = members[0]
    cmp.vm.allMembers = members
    cmp.vm.team = teamObj;
    cmp.vm.onTeamMemberRemoved(member)
    expect(cmp.vm.allMembers).toMatchObject(expectedMembers)
  })

  it('getTeamUrl(): failed', () => {
    expect(cmp.vm.getTeamUrl()).toBe(undefined)
  })

  it('getTeamUrl(): success', () => {
    cmp.vm.$store.state.activeOrganization = activeOrg
    const expectedUrl = 'https://app.blackfynn.net/organizations/777/teams/17?api_key=123'
    expect(cmp.vm.getTeamUrl()).toBe(expectedUrl)
  })

  it('getTeamMembersUrl(): failed', () => {
    expect(cmp.vm.getTeamMembersUrl()).toBe(undefined)
  })

  it('getTeamMembersUrl(): success', () => {
    cmp.vm.$store.state.activeOrganization = activeOrg
    const expectedUrl = 'https://app.blackfynn.net/organizations/777/teams/17/members?api_key=123'
    expect(cmp.vm.getTeamMembersUrl()).toBe(expectedUrl)
  })

  it('getTeam(): bad url', () => {
    expect(cmp.vm.getTeam()).toBe(undefined)
  })

  it('getTeam(): success', (done) => {
    fetch.mockResponse(JSON.stringify(teamObj), {status: 200})
    cmp.vm.$store.state.activeOrganization = activeOrg
    cmp.vm.getTeam()
    flushPromises().then(() => {
      expect(cmp.vm.team).toMatchObject(teamObj)
      done()
    })
  })

  it('getTeam(): failure', (done) => {
    fetch.mockRejectOnce('Error', {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.$store.state.activeOrganization = activeOrg
    cmp.vm.getTeam()
  })

  it('getTeamMembers(): bad url', () => {
    expect(cmp.vm.getTeamMembers()).toBe(undefined)
  })

  it('getTeamMembers(): already has members', () => {
    cmp.vm.members = members
    expect(cmp.vm.getTeamMembers()).toBe(undefined)
  })

  it('getTeamMembers(): success', (done) => {
    fetch.mockResponse(JSON.stringify(members), {status: 200})
    cmp.vm.$store.state.activeOrganization = activeOrg
    cmp.vm.getTeamMembers()
    flushPromises().then(() => {
      expect(cmp.vm.members.length).toBe(3)
      done()
    })
  })

  it('getTeamMembers(): failure', (done) => {
    fetch.mockRejectOnce('Error', {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.$store.state.activeOrganization = activeOrg
    cmp.vm.getTeamMembers()
  })

  it('sortColumn', () => {
    cmp.vm.allMembers = members
    cmp.vm.sortColumn('lastName')
    const sortedMembers = cmp.vm.returnSort('lastName', members, 'asc')
    expect(cmp.vm.allMembers).toMatchObject(sortedMembers)
  })

  it('openDeleteTeam()', (done) => {
    EventBus.$on('open-remove-team', team => {
      expect(team.team.id).toBe(17)
      done()
    })
    cmp.vm.team = teamObj
    cmp.vm.openDeleteTeam()
  })

  it('openEditTeam()', (done) => {
    EventBus.$on('open-edit-team', team => {
      expect(team.team.id).toBe(17)
      done()
    })
    cmp.vm.team = teamObj
    cmp.vm.openEditTeam()
  })

  it('openAddUser()', (done) => {
    EventBus.$on('open-add-team-members', () => {
      done()
    })
    cmp.vm.openAddUser()
  })

  it('onTeamUpdated', () => {
    const steelers = {
      team: {
        id: 36,
        name: 'Steelers'
      },
      memberCount: 56
    }
    cmp.vm.onTeamUpdated(steelers)
    expect(cmp.vm.team).toMatchObject(steelers)
  })
})
