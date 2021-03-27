import Vue from 'vue'
import { shallow } from 'vue-test-utils'
import UserRoles from './'

describe('sorter Mixin', () => {
  let cmp

  beforeEach(() => {
    const test = Vue.component('test', {
      mixins: [
        UserRoles
      ]
    })
    cmp = shallow(test)
  })

  it('getOrgRole()', () => {
    const activeOrg = {
      administrators: [{
        id: 1,
        name: 'Bob'
      }],
      owners: [{
        id: 2,
        name: 'Sue'
      }]
    }
    const bob = {
      id: 1,
      name: 'Bob'
    }
    const bobsRole = cmp.vm.getOrgRole(bob, activeOrg)
    expect(bobsRole).toBe('Administrator')

    const sue = {
      id: 2,
      name: 'Sue'
    }
    const suesRole = cmp.vm.getOrgRole(sue, activeOrg)
    expect(suesRole).toBe('Owner')

    const mike = {
      id: 3,
      name: 'Mike'
    }
    const mikesRole = cmp.vm.getOrgRole(mike, activeOrg)
    expect(mikesRole).toBe('Collaborator')
  })

  it('getOrgOwner()', () => {
    const activeOrg = {
      owners: [{
        id: 2,
        name: 'Sue'
      }]
    }
    const owner = cmp.vm.getOrgOwner(2, activeOrg.owners)
    expect(owner.role).toBe('Owner')

    const nonOwner = cmp.vm.getOrgOwner(1, activeOrg.owners)
    expect(nonOwner.role).toBe(undefined)
  })

  it('getDatasetRole()', () => {
    const user1 = {
      role: 'Administrator'
    }
    expect(cmp.vm.getDatasetRole(user1)).toBe('Administrator')

    const user2 = {}
    expect(cmp.vm.getDatasetRole(user2)).toBe('Viewer')
  })

  it('getUserDatasetRole()', () => {
    const users = [
      {
        id: 1,
        name: 'Bob',
        role: 'Viewer'
      },
      {
        id: 2,
        name: 'Sue',
        role: 'Owner'
      },
      {
        id: 3,
        name: 'Mike',
        role: 'Editor'
      }
    ]
    const role1 = cmp.vm.getUserDatasetRole(2, users)
    expect(role1).toBe('Owner')

    const role2 = cmp.vm.getUserDatasetRole(33, users)
    expect(role2).toBe('Viewer')
  })

  it('filterDatasetRoles', () => {
    const users = [
      {
        id: 1,
        name: 'Bob',
        role: 'Viewer'
      },
      {
        id: 2,
        name: 'Sue',
        role: 'Owner'
      },
      {
        id: 3,
        name: 'Mike',
        role: 'Viewer'
      }
    ]
    const viewers = cmp.vm.filterDatasetRoles('Viewer', users)
    expect(viewers.length).toBe(2)
  })
})