import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import flushPromises from 'flush-promises'

import InviteMember from './InviteMember.vue'
import EventBus from '../../../utils/event-bus'
import { actions, mutations, getters } from '../../../vuex/store'

describe('InviteMember.vue', () => {
  let cmp
  let state
  let store

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      userToken: '123',
      activeOrganization: {
        organization: {
          id: 1,
          name: 'Blackfynn'
        }
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(InviteMember, {
      attachToDocument: true,
      store
    })
    cmp.setProps({
      allOrgMembers: [{
        email: 'test@blackfynn.com'
      }]
    })
    cmp.setData({
      ruleForm: {
        email: 'test@blackfynn.com'
      }
    })
    cmp.update()
    fetch.mockResponse('', { status: 200 })
  })

  afterEach(() => {
    EventBus.$off()
  })

  it('invitationUrl: failure', () => {
    delete cmp.vm.activeOrganization.organization.id
    expect(cmp.vm.invitationUrl).toBe(undefined)
  })

  it('invitationUrl: success', () => {
    expect(cmp.vm.invitationUrl).toBe(`https://app.blackfynn.net/organizations/1/members?api_key=123`)
  })

  it('onHandleKeyPressed', () => {
    const spy = jest.spyOn(cmp.vm, 'sendInvite')
    cmp.vm.$refs.invitationForm.validate = () => true
    cmp.vm.onHandleKeyPressed()
    expect(spy).toBeCalled()
  })

  it('sendInvite: valid', () => {
    const spy = jest.spyOn(cmp.vm, 'sendRequest')
    cmp.vm.$refs.invitationForm.validate = (cb) => {
      return cb(true)
    }
    cmp.vm.sendInvite('invitationForm')
    expect(spy).toBeCalled()
  })

  it('sendInvite: invalid', () => {
    const spy = jest.spyOn(cmp.vm, 'sendRequest')
    cmp.vm.$refs.invitationForm.validate = (cb) => {
      return cb(false)
    }
    cmp.vm.sendInvite('invitationForm')
    expect(spy).not.toBeCalled()
  })

  it('sendRequest(): success', (done) => {
    fetch.mockResponse('', { status: 200 })
    const spy = jest.spyOn(cmp.vm, 'handleSucessfulInvite')
    cmp.vm.sendRequest()
    flushPromises().then(() => {
      expect(spy).toBeCalled()
      done()
    })
  })

  it('sendRequest(): error', (done) => {
    fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.sendRequest()
  })

  it('handleSucessfulInvite: member invited', (done) => {
    cmp.vm.$refs.invitationForm.resetFields = () => {}
    cmp.vm.$on('member-invited', payload => {
      expect(payload.role).toBe('Collaborator')
      expect(payload.storage).toBe(0)
      expect(payload.pending).toBe(true)
      done()
    })
    cmp.vm.handleSucessfulInvite({})
  })

  it('handleSucessfulInvite: toast', (done) => {
    cmp.vm.$refs.invitationForm.resetFields = () => {}
    EventBus.$on('toast', () => done())
    cmp.vm.handleSucessfulInvite({})
  })

  it('closeDialog()', () => {
    cmp.vm.$refs.invitationForm.resetFields = () => {}
    const spy = jest.spyOn(cmp.vm.$refs.invitationForm, 'resetFields')
    cmp.vm.closeDialog()
    expect(cmp.vm.dialogVisible).toBe(false)
    expect(spy).toBeCalled()
  })
})
