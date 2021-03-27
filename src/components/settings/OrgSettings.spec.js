import Vue from 'vue'
import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import OrgSettings from './OrgSettings.vue'
import { actions, mutations, getters } from '../../vuex/store'
import EventBus from '../../utils/event-bus'
import flushPromises from 'flush-promises'

describe.skip('OrgSettings.vue', () => {
  let cmp
  let store
  let state

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      profile: {
        id: 1
      },
      userToken: '123',
      activeOrganization: {
        organization: {
          id: 456
        },
        administrators: [{id: 5}]
      },
      orgMembers: []
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(OrgSettings, {
      attachToDocument: true,
      store
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    EventBus.$off()
  })

  it('handleGetOrg()', () => {
    const org = {
      organization: {
        storage: 1000001,
        name: 'Blackfynn'
      }
    }
    cmp.vm.handleGetOrg(org)

    expect(cmp.vm.storageNumber).toBe('1')
    expect(cmp.vm.storageUnit).toBe('MB')
    expect(cmp.vm.ruleForm.orgName).toBe('Blackfynn')
  })

  it('onHandleKeyPressed()', () => {
    const updateSpy = jest.spyOn(cmp.vm, 'updateOrg')
    cmp.vm.$refs.orgSettingsForm.validate = () => {}
    cmp.vm.onHandleKeyPressed()
    expect(updateSpy).toBeCalled()
  })

  it('updateOrg: invalid state', () => {
    const spy = jest.spyOn(cmp.vm, 'updateOrgRequest')
    cmp.vm.$refs.orgSettingsForm.validate = (cb) => {
      return cb(false)
    }
    cmp.vm.updateOrg('orgSettingsForm')
    expect(spy).not.toBeCalled()
  })

  it('updateOrg: valid state', () => {
    const spy = jest.spyOn(cmp.vm, 'updateOrgRequest')
    cmp.vm.$refs.orgSettingsForm.validate = (cb) => {
      return cb(true)
    }
    cmp.vm.ruleForm.orgName = 'Blackfynn'
    cmp.vm.updateOrg('orgSettingsForm')
    expect(spy).toBeCalled()
  })

  it('orgUrl(): good url', () => {
    const orgUrl = cmp.vm.orgUrl()
    const expectedUrl = 'https://app.blackfynn.net/organizations/456?api_key=123'
    expect(orgUrl).toBe(expectedUrl)
  })

  it('orgUrl(): bad url', () => {
    cmp.vm.$store.state.activeOrganization = {}
    const orgUrl = cmp.vm.orgUrl()
    expect(orgUrl).toBe(undefined)
  })

  it('updateOrgRequest(): success', (done) => {
    fetch.mockResponseOnce('success', {status: 200})
    EventBus.$on('toast', () => {
      done()
    })
    cmp.vm.updateOrgRequest()
  })

  it('setColumn()', () => {
    const payload = [
      {id: 3, firstName: 'Shooter', lastName: 'McGavin'},
      {id: 1, firstName: 'Bob', lastName: 'Barker'},
      {id: 2, firstName: 'Happy', lastName: 'Gilmore'}
    ]
    cmp.vm.people = payload
    cmp.vm.sortColumn('id')
    expect(cmp.vm.people[0].lastName).toBe('Barker')
  })

  it('getUsers(): success', () => {
    const payload = [
      {id: 2, firstName: 'Happy', lastName: 'Gilmore'},
      {id: 1, firstName: 'Bob', lastName: 'Barker'},
      {id: 3, firstName: 'Shooter', lastName: 'McGavin'}
    ]
    const spy = jest.spyOn(cmp.vm, 'updateCurrentMembers')
    cmp.vm.getUsers(payload)
  })

  it('updateCurrentMembers(): no storage', () => {
    const payload = [
      {id: 1, firstName: 'Bob', lastName: 'Barker'},
      {id: 2, firstName: 'Happy', lastName: 'Gilmore'},
      {id: 3, firstName: 'Shooter', lastName: 'McGavin'}
    ]
    cmp.vm.people = payload
    const updatedMembers = cmp.vm.updateCurrentMembers(payload)
    expect(updatedMembers[0].storage).toBe(0)
    expect(updatedMembers[0].role).toBe('Collaborator')
  })

  it('updateCurrentMembers(): with storage', () => {
    const payload = [
      {id: 1, firstName: 'Bob', lastName: 'Barker', storage: 1001},
      {id: 2, firstName: 'Happy', lastName: 'Gilmore', storage: 20210},
      {id: 3, firstName: 'Shooter', lastName: 'McGavin', storage: 3567889999}
    ]
    cmp.vm.people = payload
    const updatedMembers = cmp.vm.updateCurrentMembers(payload)
    expect(updatedMembers[0].storage).toBe(1001)
    expect(updatedMembers[0].role).toBe('Collaborator')
  })

  it('updateOrgRequest(): failure', (done) => {
    fetch.mockResponseOnce(JSON.stringify({message: 'Error'}), {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.updateOrgRequest()
  })
})
