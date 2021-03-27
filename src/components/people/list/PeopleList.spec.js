import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import { actions, mutations, getters } from '../../../vuex/store'
import PeopleList from './PeopleList.vue'
import EventBus from '../../../utils/event-bus'
import flushPromises from 'flush-promises'


describe('PeopleList.vue', () => {
  let cmp
  let store
  let state
  let people

  beforeEach(() => {
    people = [
      {id: 1, firstName: 'Carson', lastName: 'Wentz', isAdmin: true, isOwner: false, role: 'Administrator'},
      {id: 2, firstName: 'Jason', lastName: 'Kelce', isAdmin: false, isOwner: false, role: 'Collaborator'},
      {id: 3, firstName: 'Jay', lastName: 'Ajayi', isAdmin: false, isOwner: false, role: 'Collaborator'},
      {id: 4, firstName: 'Zach', lastName: 'Ertz', isAdmin: false, isOwner: false, role: 'Collaborator'},
      {id: 5, firstName: 'Jeffrey', lastName: 'Lurie', isAdmin: false, isOwner: true, role: 'Owner'}
    ]
    state = {
      orgMembers: people,
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      profile: {
        id: 1,
        firstName: 'Carson',
        lastName: 'Wentz',
        isAdmin: true,
        isOwner: false
      },
      userToken: '123',
      activeOrganization: {
        isAdmin: true,
        isOwner: false,
        organization: {
          name: 'Blackfynn',
          id: 777
        },
        administrators: [{id: 1}],
        owners: [{id: 5}]
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(PeopleList, {
      attachToDocument: true,
      store
    })
  })

  it('hasAdminRights: not an admin or owner', () => {
    cmp.vm.activeOrganization.isAdmin = false
    cmp.vm.activeOrganization.isOwner = false
    expect(cmp.vm.hasAdminRights).toBe(false)
  })

  it('hasAdminRights: isOwner', () => {
    cmp.vm.activeOrganization.isAdmin = false
    cmp.vm.activeOrganization.isOwner = true
    expect(cmp.vm.hasAdminRights).toBe(true)
  })

  it('hasAdminRights: isAdmin', () => {
    expect(cmp.vm.hasAdminRights).toBe(true)
  })

  it('onHandleMemberInvited', () => {
    const newPerson = [{
      id: 6,
      firstName: 'Alshon',
      lastName: 'Jeffrey',
      isAdmin: false,
      isOwner: false
    }]
    cmp.vm.onHandleMemberInvited(newPerson)
    expect(cmp.vm.people.length).toBe(1)
  })

  it('getInvitedPeopleUrl(): success', () => {
    const expectedUrl = 'https://app.blackfynn.net/organizations/777/invites?api_key=123'
    const getUrl = cmp.vm.getInvitedPeopleUrl()
    expect(getUrl).toBe(expectedUrl)
  })

  it('getInvitedPeopleUrl(): failed', () => {
    delete cmp.vm.activeOrganization.organization
    const getUrl = cmp.vm.getInvitedPeopleUrl()
    expect(getUrl).toBe(undefined)
  })

  it('onMemberUpdated()', () => {
    const spy = jest.spyOn(cmp.vm, 'updateOrgMembers')
    const member = {
      id: 2,
      firstName: 'Jason',
      lastName: 'Kelce',
      isAdmin: true,
      isOwner: false
    }
    cmp.vm.sortBy = 'lastName'
    cmp.vm.allPeople = people
    cmp.vm.onMemberUpdated(member)
    const numAdmins = cmp.vm.allPeople.filter(person => person.isAdmin)
    expect(numAdmins.length).toBe(2)
    expect(spy).toBeCalled()
  })

  it('onPromoteToAdmin()', () => {
    const spy = jest.spyOn(cmp.vm, 'updateOrgMembers')
    const member = {
      id: 2,
      firstName: 'Jason',
      lastName: 'Kelce',
      isAdmin: false,
      isOwner: false,
      role: 'editor'
    }
    cmp.vm.sortBy = 'lastName'
    cmp.vm.allPeople = people
    cmp.vm.onPromoteToAdmin(member)
    const numAdmins = cmp.vm.allPeople.filter(person => person.role === 'manager')
    expect(numAdmins.length).toBe(1)
    expect(spy).toBeCalled()
  })

  it('onDemoteFromAdmin()', () => {
    const spy = jest.spyOn(cmp.vm, 'updateOrgMembers')
    const member = {
      id: 1,
      firstName: 'Carson',
      lastName: 'Wentz',
      isAdmin: true,
      isOwner: false,
      role: 'Administrator'
    }
    cmp.vm.sortBy = 'lastName'
    cmp.vm.allPeople = people
    cmp.vm.onDemoteFromAdmin(member)
    const numAdmins = cmp.vm.allPeople.filter(person => person.role === 'Administrator')
    expect(numAdmins.length).toBe(0)
    expect(spy).toBeCalled()
  })

  it('onMemberRemoved()', () => {
    cmp.vm.allPeople = people
    const member = {
      id: 2,
      firstName: 'Jason',
      lastName: 'Kelce',
      isAdmin: false,
      isOwner: false
    }
    cmp.vm.onMemberRemoved(member)
    expect(cmp.vm.allPeople.length).toBe(4)
  })

  it('sortColumn', () => {
    cmp.vm.allPeople = people
    cmp.vm.sortColumn('lastName')
    const sortedPeople = cmp.vm.returnSort('lastName', people, 'asc')
    expect(cmp.vm.allPeople).toMatchObject(sortedPeople)
  })

  it('updatePendingMembers', () => {
    const users = [{id: 1}, {id: 2}, {id: 3}]
    const updatedUsers = cmp.vm.updatePendingMembers(users)
    const userCount = updatedUsers.filter(user => user.pending)
    expect(userCount.length).toBe(3)
  })

  it('updateCurrentMembers: no storage property', () => {
    const users = [{id: 1}, {id: 2}, {id: 3}]
    const updatedUsers = cmp.vm.updateCurrentMembers(users)
    const userCount = updatedUsers.filter(user => user.storage === 0)
    expect(userCount.length).toBe(3)
  })

  it('updateCurrentMembers: already has storage property', () => {
    const users = [{id: 1, storage: 100}, {id: 2, storage: 300011}, {id: 3, storage: 9988726211}]
    const updatedUsers = cmp.vm.updateCurrentMembers(users)
    const userCount = updatedUsers.filter(user => user.storage === 0)
    expect(userCount.length).toBe(0)
  })

  it('getUsersRequest(): success', (done) => {
    fetch.mockResponseOnce(JSON.stringify([[], people]), {status: 200})
    cmp.vm.getUsersRequest()
    flushPromises().then(() => {
      done()
    })
  })

  it('getUsersRequest(): success, same number as orgMembers', (done) => {
    cmp.vm.people = cmp.vm.orgMembers
    fetch.mockResponseOnce(JSON.stringify([[], cmp.vm.people]), {status: 200})
    cmp.vm.getUsersRequest()
    flushPromises().then(() => {
      done()
    })
  })

  it('getUsersRequest(): failure', (done) => {
    fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.getUsersRequest()
  })

  it('openDialog', () => {
    expect(cmp.vm.isInviteVisible).toBe(false)
    cmp.vm.openDialog()
    expect(cmp.vm.isInviteVisible).toBe(true)
  })
})
