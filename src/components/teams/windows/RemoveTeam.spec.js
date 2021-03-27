import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import RemoveTeam from './RemoveTeam.vue'
import { actions, mutations, getters } from '../../../vuex/store'
import EventBus from '../../../utils/event-bus'
import flushPromises from 'flush-promises'

const $router = {
  push: jest.fn(() => {})
}

describe('RemoveTeam.vue', () => {
  let cmp
  let store
  let state
  let $route

  beforeEach(() => {
    $route = {
      name: ''
    }
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      userToken: '123',
      activeOrganization: {
        organization: {
          name: 'Blackfynn',
          id: 666
        }
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(RemoveTeam, {
      attachToDocument: true,
      mocks: {
        $route,
        $router
      },
      store
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    EventBus.$off()
  })

  it('closeDialog', () => {
    cmp.vm.closeDialog()
    expect(cmp.vm.dialogVisible).toBe(false)
  })

  it('handleRemoveTeam', () => {
    const myTeam = {
      team: {
        id: 1,
        name: 'Iggles'
      }
    }
    cmp.vm.handleRemoveTeam(myTeam)
    expect(cmp.vm.team).toMatchObject(myTeam.team)
    expect(cmp.vm.dialogVisible).toBe(true)
  })

  it('deleteUrl', () => {
    cmp.vm.team = {id: 777}
    const expectedUrl = 'https://app.blackfynn.net/organizations/666/teams/777?api_key=123'
    const deleteUrl = cmp.vm.deleteUrl()
    expect(deleteUrl).toBe(expectedUrl)
  })

  it('removeTeam(): success toast', (done) => {
    cmp.vm.team = {
      id: 1,
      name: 'Iggles'
    }
    EventBus.$on('toast', payload => {
      const expectedMsg = `${cmp.vm.team.name} removed from ${cmp.vm.activeOrganization.organization.name}`
      expect(payload.detail.msg).toBe(expectedMsg)
      done()
    })
    fetch.mockResponseOnce('toast', {status: 201})
    cmp.vm.removeTeam()
  })

  it('removeTeam(): success event emitted', (done) => {
    const spy = jest.spyOn(cmp.vm, 'closeDialog')
    cmp.vm.$on('team-removed', () => {
      expect(spy).toBeCalled()
      done()
    })
    fetch.mockResponseOnce('emit event', {status: 201})
    cmp.vm.removeTeam()
  })

  it('removeTeam(): success + redirect', (done) => {
    cmp.vm.$route.name = 'team-members-list'
    const spy = jest.spyOn(cmp.vm.$router, 'push')
    fetch.mockResponseOnce('', {status: 200})
    cmp.vm.removeTeam()
    flushPromises().then(() => {
      expect(spy).toBeCalled()
      done()
    })
  })

  it('removeTeam(): failure', (done) => {
    fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.removeTeam()
  })
})
