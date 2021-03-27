import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import ExploreCollaborators from './ExploreCollaborators.vue'
import EventBus from '../../../utils/event-bus'
import { actions, mutations, getters } from '../../../vuex/store'
import flushPromises from 'flush-promises'

describe('ExploreCollaborators.vue', () => {
  let cmp
  let cmpNoActiveOrg
  let store
  let state

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      profile: {
        id: 1,
        firstName: 'Carson',
        lastName: 'Wentz',
        email: 'cwentz@eagles.com'
      },
      userToken: '123',
      activeOrganization: {
        organization: {
          id: 1,
          name: 'Blackfynn'
        }
      },
      orgMembers: [
        {id: 1, firstName: 'Carson', lastName: 'Wentz', isAdmin: true, isOwner: false, role: 'Administrator'},
        {id: 2, firstName: 'Jason', lastName: 'Kelce', isAdmin: false, isOwner: false, role: 'Collaborator'},
        {id: 3, firstName: 'Jay', lastName: 'Ajayi', isAdmin: false, isOwner: false, role: 'Collaborator'},
        {id: 4, firstName: 'Zach', lastName: 'Ertz', isAdmin: false, isOwner: false, role: 'Collaborator'},
        {id: 5, firstName: 'Jeffrey', lastName: 'Lurie', isAdmin: false, isOwner: true, role: 'Owner'}
      ],
      teams: [
        {team: {id: 1, name: 'Eagles'}}
      ],
      dataset: {
        owner: 5,
        content: {
          id: 11,
          name: 'Playbook'
        },
        collaboratorCounts: {
          organizations: 1,
          teams: 0,
          users: 0
        }
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(ExploreCollaborators, {
      store
    })
    cmpNoActiveOrg = shallow(ExploreCollaborators, {
      store: Object.assign({}, store, {state: null})
    })
  })

  it('watch dataset', (done) => {
    const spy = jest.spyOn(cmp.vm, 'getCollaborators')
    cmp.vm.collaborators = []
    cmp.vm.$store.state.dataset = {
      owner: 5,
      content: {
        id: 11,
        name: 'Playbook'
      },
      collaboratorCounts: {
        organizations: 0,
        teams: 3,
        users: 4
      }
    }
    cmp.vm.$nextTick(() => {
      expect(spy).toBeCalled()
      done()
    })
  })

  it('watch dataset: not called', (done) => {
    const spy = jest.spyOn(cmp.vm, 'getCollaborators')
    cmp.vm.collaborators = []
    cmp.vm.$nextTick(() => {
      expect(spy).not.toBeCalled()
      done()
    })
  })

  it('watch dataset: not called', (done) => {
    const spy = jest.spyOn(cmp.vm, 'getCollaborators')
    cmp.vm.collaborators = cmp.vm.$store.orgMembers
    cmp.vm.$nextTick(() => {
      expect(spy).not.toBeCalled()
      done()
    })
  })

  it('sharedWith', () => {
    expect(cmp.vm.sharedWith).toBe('Organization')
  })

  it('sharedWith: no collaborator counts', () => {
    cmp.vm.$store.state.dataset = {}
    expect(cmp.vm.sharedWith).toBe(undefined)
  })

  it('datasetOwner', () => {
    const owner = cmp.vm.datasetOwner
    expect(owner.lastName).toBe('Lurie')
  })

  it('getCollaboratorsUrl: with token', () => {
    const expectedUrl = 'https://app.blackfynn.net/datasets/11/collaborators?api_key=123'
    expect(cmp.vm.getCollaboratorsUrl()).toBe(expectedUrl)
  })

  it('getCollaboratorsUrl: no token', () => {
    cmp.vm.$store.state.userToken = null
    expect(cmp.vm.getCollaboratorsUrl()).toBe(undefined)
  })

  it('getCollaborators(): bad url', () => {
    cmp.vm.$store.state.userToken = null
    expect(cmp.vm.getCollaborators()).toBe(undefined)
  })

  it('getCollaborators(): success', (done) => {
    const response = {
      teams: cmp.vm.$store.state.teams,
      users: cmp.vm.$store.state.orgMembers
    }
    fetch.mockResponse(JSON.stringify(response), {status: 200})
    cmp.vm.getCollaborators()
    flushPromises().then(() => {
      expect(cmp.vm.collaborators.length).toBe(4)
      done()
    })
  })

  it('getCollaborators(): failure', (done) => {
    fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.getCollaborators()
  })
})
