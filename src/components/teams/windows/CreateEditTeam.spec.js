import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import CreateEditTeam from './CreateEditTeam.vue'
import { actions, mutations, getters } from '../../../vuex/store'
import EventBus from '../../../utils/event-bus'
import flushPromises from 'flush-promises'

const Event = {
  preventDefault: jest.fn(() => {})
}

describe('CreateEditTeam.vue', () => {
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
          id: 666
        }
      },
      teams: [
        {
          team: {
            id: 17,
            name: 'The Birds'
          }
        }, {
          team: {
            id: 11,
            name: 'The Giants'
          }
        }
      ]
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(CreateEditTeam, {
      attachToDocument: true,
      propsData: {
        team: {
          team: {
            id: 17,
            name: 'The Birds'
          }
        }
      },
      store
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    EventBus.$off()
  })

  it('onHandleKeyPressed', () => {
    const spy = jest.spyOn(cmp.vm, 'createEditTeam')
    cmp.vm.$refs.teamForm.validate = () => {}
    cmp.vm.onHandleKeyPressed(Event)
    expect(Event.preventDefault).toBeCalled()
    expect(spy).toBeCalled()
  })

  it('onOpenTeam: create', () => {
    const team = {}
    cmp.vm.onOpenTeam(team)
    expect(cmp.vm.dialogVisible).toBe(true)
    expect(cmp.vm.ruleForm.name).toBe('')
    expect(cmp.vm.isEditing).toBe(false)
    expect(cmp.vm.modalTitle).toBe('Create team')
  })

  it('onOpenTeam: edit', () => {
    cmp.vm.onOpenTeam({
      team: {
        name: 'Iggles'
      }
    })
    expect(cmp.vm.dialogVisible).toBe(true)
    expect(cmp.vm.ruleForm.name).toBe('Iggles')
    expect(cmp.vm.isEditing).toBe(true)
    expect(cmp.vm.modalTitle).toBe('Update team')
  })

  it('teamNameExists', () => {
    const teamA = cmp.vm.teamNameExists('The Birds')
    expect(teamA).toBe(true)

    const teamB = cmp.vm.teamNameExists('The Redskins')
    expect(teamB).toBe(false)
  })

  it('createUrl: POST', () => {
    const expectedUrl = 'https://app.blackfynn.net/organizations/666/teams?api_key=123'
    const createUrl = cmp.vm.createUrl('POST')
    expect(createUrl).toBe(expectedUrl)
  })

  it('createUrl: PUT', () => {
    const expectedUrl = 'https://app.blackfynn.net/organizations/666/teams/17?api_key=123'
    const createUrl = cmp.vm.createUrl('PUT')
    expect(createUrl).toBe(expectedUrl)
  })

  it('closeDialog', () => {
    cmp.vm.closeDialog()
    expect(cmp.vm.dialogVisible).toBe(false)
  })

  it('createEditTeam: invalid state', () => {
    const spy = jest.spyOn(cmp.vm, 'submitRequest')
    cmp.vm.$refs.teamForm.validate = (cb) => {
      return cb(false)
    }
    cmp.vm.createEditTeam('teamForm')
    expect(spy).not.toBeCalled()
  })

  it('createEditTeam: valid state', () => {
    cmp.vm.ruleForm.name = 'The Iggles'
    const spy = jest.spyOn(cmp.vm, 'submitRequest')
    cmp.vm.$refs.teamForm.validate = (cb) => {
      return cb(true)
    }
    cmp.vm.createEditTeam('teamForm')
    expect(spy).toBeCalled()
  })

  it('createEditTeam: same name', () => {
    cmp.vm.ruleForm.name = 'The Birds'
    const spy = jest.spyOn(cmp.vm, 'closeDialog')
    cmp.vm.$refs.teamForm.validate = (cb) => {
      return cb(true)
    }
    cmp.vm.createEditTeam('teamForm')
    expect(spy).toBeCalled()
  })

  it('submitRequest(): success + close dialog', (done) => {
    const closeSpy = jest.spyOn(cmp.vm, 'closeDialog')
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.submitRequest()
    flushPromises().then(() => {
      expect(closeSpy).toBeCalled()
      done()
    })
  })

  it('submitRequest(): success + created toast', (done) => {
    cmp.vm.team = {}
    const closeSpy = jest.spyOn(cmp.vm, 'closeDialog')
    EventBus.$on('toast', payload => {
      const expectedMsg = `${cmp.vm.ruleForm.name} created`
      expect(payload.detail.msg).toBe(expectedMsg)
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.submitRequest()
  })

  it('submitRequest(): success + team-created event', (done) => {
    cmp.vm.team = {}
    const closeSpy = jest.spyOn(cmp.vm, 'closeDialog')
    cmp.vm.$on('team-created', () => {
      done()
    })
    fetch.mockResponseOnce('team-created', {status: 200})
    cmp.vm.submitRequest()
  })

  it('submitRequest(): success + updated toast', (done) => {
    EventBus.$on('toast', payload => {
      const expectedMsg = `${cmp.vm.ruleForm.name} updated`
      expect(payload.detail.msg).toBe(expectedMsg)
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.submitRequest()
  })

  it('submitRequest(): success + team-updated event', (done) => {
    cmp.vm.$on('team-updated', () => {
      done()
    })
    fetch.mockResponseOnce('team-updated', {status: 200})
    cmp.vm.submitRequest()
  })

  it('submitRequest(): failure', (done) => {
    fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.submitRequest()
  })

  it('resetForm', () => {
    cmp.vm.$refs.teamForm.resetFields = jest.fn(() => {})
    cmp.vm.resetForm('teamForm')
    expect(cmp.vm.$refs.teamForm.resetFields).toBeCalled()
  })
})
