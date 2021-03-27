import Vue from 'vue'
import { shallow } from 'vue-test-utils'

import sharing from './'

describe('sharing Mixin', () => {

  let cmp
  beforeEach(() => {
    const TestComponent = Vue.component('test', {
      mixins: [
        sharing
      ]
    })
    cmp = shallow(TestComponent)
  })

  it('displayTeams: 1 Team', () => {
    const str = cmp.vm.displayTeams(1)
    expect('1 team').toBe(str)
  })

  it('displayTeams: Multiple Teams', () => {
    const str = cmp.vm.displayTeams(3)
    expect('3 teams').toBe(str)
  })

  it('displayUsers: 1 User', () => {
    const str = cmp.vm.displayUsers(1)
    expect('1 user').toBe(str)
  })

  it('displayUsers: Multiple Users', () => {
    const str = cmp.vm.displayUsers(3)
    expect('3 users').toBe(str)
  })

  it('peopleShared: no one', () => {
    const collaborators = {
      organizations: 0,
      teams: 0,
      users: 0
    }
    const str = cmp.vm.peopleShared(collaborators)
    expect('no one').toBe(str)
  })

  it('peopleShared: everyone', () => {
    const collaborators = {
      organizations: 1,
      teams: 0,
      users: 0
    }
    const str = cmp.vm.peopleShared(collaborators)
    expect('everyone').toBe(str)
  })

  it('peopleShared: 1 team, 3 users', () => {
    const collaborators = {
      organizations: 0,
      teams: 1,
      users: 3
    }
    const str = cmp.vm.peopleShared(collaborators)
    expect('1 team, 3 users').toBe(str)
  })

  it('getSharedWith: Private', () => {
    const collaborators = {
      organizations: 0,
      teams: 0,
      users: 0
    }
    const str = cmp.vm.getSharedWith(collaborators)
    expect('Private').toBe(str)
  })

  it('getSharedWith: Organization', () => {
    const collaborators = {
      organizations: 1,
      teams: 0,
      users: 0
    }
    const str = cmp.vm.getSharedWith(collaborators)
    expect('Organization').toBe(str)
  })

  it('getSharedWith: 1 Collaborator', () => {
    const collaborators = {
      organizations: 0,
      teams: 0,
      users: 1
    }
    const str = cmp.vm.getSharedWith(collaborators)
    expect('1 Collaborator').toBe(str)
  })

  it('getSharedWith: 5 Collaborators', () => {
    const collaborators = {
      organizations: 0,
      teams: 2,
      users: 3
    }
    const str = cmp.vm.getSharedWith(collaborators)
    expect('5 Collaborators').toBe(str)
  })

  it('getSharedIcon: icon-lock-filled', () => {
    const collaborators = {
      organizations: 0,
      teams: 0,
      users: 0
    }
    const str = cmp.vm.getSharedIcon(collaborators)
    expect('icon-lock-filled').toBe(str)
  })

  it('getSharedIcon: icon-organization', () => {
    const collaborators = {
      organizations: 1,
      teams: 0,
      users: 0
    }
    const str = cmp.vm.getSharedIcon(collaborators)
    expect('icon-organization').toBe(str)
  })

  it('getSharedIcon: icon-team', () => {
    const collaborators = {
      organizations: 0,
      teams: 0,
      users: 7
    }
    const str = cmp.vm.getSharedIcon(collaborators)
    expect('icon-team').toBe(str)
  })
})