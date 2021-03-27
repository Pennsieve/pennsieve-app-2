import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import OrgMember from './OrgMember.vue'
import EventBus from '../../../utils/event-bus'
import { actions, mutations, getters } from '../../../vuex/store'

describe('OrgMember.vue', () => {
  let cmp
  let state
  let store

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.pennsieve.net'
      },
      profile: {
        id: 1,
        firstName: 'Dick',
        lastName: 'Tracy',
        email: 'dtracy@detective.com'
      },
      userToken: '123',
      activeOrganization: {
        organization: {
          id: 1,
          name: 'Pennsieve'
        }
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(OrgMember, {
      attachToDocument: true,
      store
    })
  })

  afterEach(() => {
    EventBus.$off()
  })

  it('status: undefined', () => {
    cmp.setProps({
      item: {}
    })
    cmp.update()
    expect(cmp.vm.status).toBe('')
  })

  it('status: Expired', () => {
    cmp.setProps({
      item: {
        pending: true,
        validUntil: 1519880400000
      }
    })
    cmp.update()
    expect(cmp.vm.status).toBe('Expired')
  })

  it('status: Pending', () => {
    const dt = new Date()
    const tomorrow = dt.setDate(dt.getDate() + 1)
    cmp.setProps({
      item: {
        pending: true,
        validUntil: tomorrow
      }
    })
    cmp.update()
    expect(cmp.vm.status).toBe('Pending')
  })

  it('statusClass', () => {
    cmp.setProps({
      item: {
        pending: true,
        validUntil: 1519880400000
      }
    })
    cmp.update()
    expect(cmp.vm.statusClass).toBe('member-status expired')
  })

  it('dataUsage', () => {
    cmp.setProps({
      item: {
        storage: 100000,
      }
    })
    cmp.update()
    expect(cmp.vm.dataUsage).toBe('100 KB')
  })

  it('resendInvite(): success', (done) => {
    EventBus.$on('toast', payload => {
      expect(payload.detail.msg).toBe('Invite resent')
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.resendInvite(555)
  })

  it('resendInvite(): failure', (done) => {
    fetch.mockRejectOnce('toast', {status: 500})
    EventBus.$on('toast', payload => {
      expect(payload.detail.msg).toBe('Error resending invite')
      done()
    })
    cmp.vm.resendInvite(555)
  })

  it('handleCommand: valid commands', () => {
    const removeSpy = jest.spyOn(cmp.vm, 'removeMember')
    const promoteSpy = jest.spyOn(cmp.vm, 'setAdminStatus')
    const demoteSpy = jest.spyOn(cmp.vm, 'setAdminStatus')
    const resetSpy = jest.spyOn(cmp.vm, 'resetPassword')
    const editSpy = jest.spyOn(cmp.vm, 'editMember')

    cmp.vm.handleCommand('remove')
    cmp.vm.handleCommand('promote-admin')
    cmp.vm.handleCommand('demote-admin')
    cmp.vm.handleCommand('reset-password')
    cmp.vm.handleCommand('edit-member')

    expect(removeSpy).toBeCalled()
    expect(promoteSpy).toBeCalled()
    expect(demoteSpy).toBeCalled()
    expect(resetSpy).toBeCalled()
    expect(editSpy).toBeCalled()
  })

  it('handleCommand: invalid command', () => {
    const spy = jest.spyOn(cmp.vm, 'removeMember')
    cmp.vm.handleCommand('remove-this')
    expect(spy).not.toBeCalled()
  })

  it('editMember', (done) => {
    const data = 123
    EventBus.$on('update-org-member', payload => {
      expect(payload).toBe(data)
      done()
    })
    cmp.vm.editMember(data)
  })

  it('removeMember', (done) => {
    const data = 123
    EventBus.$on('remove-org-member', payload => {
      expect(payload).toBe(data)
      done()
    })
    cmp.vm.removeMember(data)
  })

  it('creatPutUrl', () => {
    const expectedUrl = `https://app.pennsieve.net/organizations/1/members/555?api_key=123`
    const putUrl = cmp.vm.createPutUrl(555)
    expect(putUrl).toBe(expectedUrl)
  })

  it('setAdminStatus(): successful toast event', (done) => {
    cmp.setProps({
      item: {
        firstName: 'Dick',
        lastName: 'Tracy'
      }
    })
    cmp.update()
    EventBus.$on('toast', payload => {
      expect(payload.detail.msg).toBe('Dick Tracy has been promoted to admin')
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.setAdminStatus(cmp.vm.item, 'administer')
  })

  it('setAdminStatus(): successful promote-to-admin event', (done) => {
    cmp.vm.$on('promote-to-admin', payload => {
      expect(payload).toMatchObject(cmp.vm.profile)
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.setAdminStatus(cmp.vm.profile, 'administer')
  })

  it('setAdminStatus(): failure', (done) => {
    cmp.setProps({
      item: {
        firstName: 'Dick',
        lastName: 'Tracy'
      }
    })
    cmp.update()
    fetch.mockRejectOnce('toast', {status: 500})
    EventBus.$on('toast', payload => {
      expect(payload.detail.msg).toBe('Error promoting Dick Tracy to admin')
      done()
    })
    cmp.vm.setAdminStatus(cmp.vm.item, 'administer')
  })

  it('setAdminStatus(): successful toast event', (done) => {
    cmp.setProps({
      item: {
        firstName: 'Dick',
        lastName: 'Tracy'
      }
    })
    cmp.update()
    EventBus.$on('toast', payload => {
      expect(payload.detail.msg).toBe('Dick Tracy has been demoted to collaborator')
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.setAdminStatus(cmp.vm.item, 'delete')
  })

  it('setAdminStatus(): successful demote-from-admin event', (done) => {
    cmp.vm.$on('demote-from-admin', payload => {
      expect(payload).toMatchObject(cmp.vm.profile)
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.setAdminStatus(cmp.vm.profile, 'delete')
  })

  it('setAdminStatus(): failure', (done) => {
    cmp.setProps({
      item: {
        firstName: 'Dick',
        lastName: 'Tracy'
      }
    })
    cmp.update()
    fetch.mockRejectOnce('toast', {status: 500})
    EventBus.$on('toast', payload => {
      expect(payload.detail.msg).toBe('Error demoting Dick Tracy to collaborator')
      done()
    })
    cmp.vm.setAdminStatus(cmp.vm.item, 'delete')
  })

  it('resetPassword(): successful toast event', (done) => {
    cmp.setProps({
      item: {
        firstName: 'Tess',
        lastName: 'Trueheart'
      }
    })
    cmp.update()
    EventBus.$on('toast', payload => {
      expect(payload.detail.msg).toBe(`Tess Trueheart's password has been reset`)
      done()
    })
    fetch.mockResponseOnce('toast', {status: 200})
    cmp.vm.resetPassword(cmp.vm.item)
  })

  it('resetPassword(): successful logout', (done) => {
    cmp.setProps({
      item: {
        firstName: 'Dick',
        lastName: 'Tracy',
        email: 'dtracy@detective.com'
      }
    })
    cmp.update()
    EventBus.$on('logout', () => {
      done()
    })
    fetch.mockResponseOnce('logout', {status: 200})
    cmp.vm.resetPassword(cmp.vm.item)
  })

  it('resetPassword(): failure', (done) => {
    cmp.setProps({
      item: {
        firstName: 'Dick',
        lastName: 'Tracy'
      }
    })
    cmp.update()
    fetch.mockRejectOnce('toast', {status: 500})
    EventBus.$on('toast', payload => {
      expect(payload.detail.msg).toBe(`Error resetting Dick Tracy's password`)
      done()
    })
    cmp.vm.resetPassword(cmp.vm.item)
  })
})
