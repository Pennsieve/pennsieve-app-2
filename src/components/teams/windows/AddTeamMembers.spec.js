import Vue from 'vue'
import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import AddTeamMembers from './AddTeamMembers.vue'
import { actions, mutations, getters } from '../../../vuex/store'
import EventBus from '../../../utils/event-bus'
import flushPromises from 'flush-promises'

const origMembers = [
  {
    id: 1,
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'bwayne@dc.com'
  },
  {
    id: 2,
    firstName: 'Richard',
    lastName: 'Grayson',
    email: 'rgrayson@dc.com'
  },
  {
    id: 3,
    firstName: 'Barbara',
    lastName: 'Gordon',
    email: 'bgordon@dc.com'
  }
]

describe('AddTeamMembers.vue', () => {
  let cmp
  let store
  let state

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      userToken: '123',
      activeOrganization: {
        organization: {
          name: 'Blackfynn',
          id: 777
        }
      },
      orgMembers: origMembers
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(AddTeamMembers, {
      attachToDocument: true,
      propsData: {
        team: {
          team: {
            id: 98,
            name: 'The Birds'
          }
        },
        members: []
      },
      store
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    EventBus.$off()
  })

  it('teamName', () => {
    expect(cmp.vm.teamName).toBe('The Birds')
  })

  it('Handles click event', (done) => {
    cmp.vm.$refs.popover.showPopper = true
    const spy = jest.spyOn(cmp.vm, 'toggleMembers')
    cmp.trigger('click')
    cmp.vm.$nextTick(() => {
      expect(spy).toBeCalled()
      done()
    })
  })

  it('Handles click event', (done) => {
    cmp.vm.$refs.popover.showPopper = false
    const spy = jest.spyOn(cmp.vm, 'toggleMembers')
    cmp.trigger('click')
    cmp.vm.$nextTick(() => {
      expect(spy).not.toBeCalled()
      done()
    })
  })

  it('addToTeam: invalid state', () => {
    const spy = jest.spyOn(cmp.vm, 'addToTeamRequest')
    cmp.vm.$refs.userSearchForm.validate = (cb) => {
      return cb(false)
    }
    cmp.vm.addToTeam('userSearchForm')
    expect(spy).not.toBeCalled()
  })

  it('addToTeam: valid state', () => {
    cmp.vm.ruleForm.searchText = 'Joe Black'
    const spy = jest.spyOn(cmp.vm, 'addToTeamRequest')
    cmp.vm.$refs.userSearchForm.validate = (cb) => {
      return cb(true)
    }
    cmp.vm.addToTeam('userSearchForm')
    expect(spy).toBeCalled()
  })

  it('addToTeamUrl', () => {
    const expectedUrl = 'https://app.blackfynn.net/organizations/777/teams/98/members?api_key=123'
    const url = cmp.vm.addToTeamUrl()
    expect(url).toBe(expectedUrl)
  })

  it('addToTeamRequest(): success + close dialog', (done) => {
    cmp.vm.selectedMembers = origMembers
    const closeSpy = jest.spyOn(cmp.vm, 'closeDialog')
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.addToTeamRequest()
    flushPromises().then(() => {
      expect(closeSpy).toBeCalled()
      done()
    })
  })

  it('addToTeamRequest(): success + updated toast', (done) => {
    cmp.vm.selectedMembers = origMembers
    EventBus.$on('toast', payload => {
      const expectedMsg = `Team member(s) added for ${cmp.vm.teamName}`
      expect(payload.detail.msg).toBe(expectedMsg)
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.addToTeamRequest()
  })

  it('addToTeamRequest(): success + members-added-to-team event', (done) => {
    cmp.vm.selectedMembers = origMembers
    cmp.vm.$on('members-added-to-team', () => {
      done()
    })
    fetch.mockResponseOnce(JSON.stringify(origMembers), {status: 200})
    cmp.vm.addToTeamRequest()
  })

  it('addToTeamRequest(): no selected ids', () => {
    expect(cmp.vm.addToTeamRequest()).toBe(undefined)
  })

  it('addToTeamRequest(): failure', (done) => {
    cmp.vm.selectedMembers = origMembers
    fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.addToTeamRequest()
  })

  it('selectMember()', () => {
    cmp.vm.origMembers = origMembers
    cmp.vm.selectMember(origMembers[1])
    expect(cmp.vm.selectedMembers).toMatchObject([origMembers[1]])
  })

  it('toggleMembers()', () => {
    cmp.vm.$refs.popover.showPopper = false
    cmp.vm.toggleMembers(true)
    expect(cmp.vm.$refs.popover.showPopper).toBe(true)
  })

  it('onRemoveMemberFromList()', () => {
    cmp.vm.selectedMembers = origMembers
    cmp.vm.onRemoveMemberFromList(origMembers[2])
    expect(cmp.vm.selectedMembers).toMatchObject([origMembers[0], origMembers[1]])
  })

  it('filterMembers(): no match', () => {
    cmp.vm.origMembers = origMembers
    cmp.vm.ruleForm.searchText = 'Alfred Pennyweather'
    cmp.vm.filterMembers()
    expect(cmp.vm.filteredMembers).toMatchObject([])
  })

  it('filterMembers(): match name', () => {
    cmp.vm.origMembers = origMembers
    cmp.vm.ruleForm.searchText = 'Barbara G'
    cmp.vm.filterMembers()
    expect(cmp.vm.filteredMembers).toMatchObject([origMembers[2]])
  })

  it('filterMembers(): match email', () => {
    cmp.vm.origMembers = origMembers
    cmp.vm.ruleForm.searchText = 'rgrayson'
    cmp.vm.filterMembers()
    expect(cmp.vm.filteredMembers).toMatchObject([origMembers[1]])
  })

  it('onOpenTeamMembers(): no filtered members', (done) => {
    cmp.vm.filteredMembers = []
    cmp.vm.onOpenTeamMembers()
    expect(cmp.vm.dialogVisible).toBe(true)
    flushPromises().then(() => {
      const sortedMembers = cmp.vm.returnSort('lastName', origMembers, 'asc')
      expect(cmp.vm.origMembers).toMatchObject(sortedMembers)
      expect(cmp.vm.filteredMembers).toMatchObject(cmp.vm.origMembers)
      done()
    })
  })

  it('onOpenTeamMembers(): filtered members', () => {
    const spy = jest.spyOn(cmp.vm, 'getMembers')
    cmp.vm.filteredMembers = origMembers
    cmp.vm.onOpenTeamMembers()
    expect(cmp.vm.dialogVisible).toBe(true)
    expect(spy).not.toBeCalled()
  })

  it('closeDialog()', () => {
    expect(cmp.vm.dialogVisible).toBe(false)
    expect(cmp.vm.ruleForm.searchText).toBe('')
    expect(cmp.vm.filteredMembers).toMatchObject([])
    expect(cmp.vm.selectedMembers).toMatchObject([])
  })

  it('resetForm()', (done) => {
    cmp.vm.$refs.userSearchForm.resetFields = jest.fn(() => {})
    cmp.vm.resetForm('userSearchForm')
    cmp.vm.$nextTick(() => {
      expect(cmp.vm.$refs.userSearchForm.resetFields).toBeCalled()
      done()
    })
  })

})
