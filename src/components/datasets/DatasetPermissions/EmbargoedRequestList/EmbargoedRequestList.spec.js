import { mount } from 'vue-test-utils'
import Vuex from 'vuex'
import { state } from '@/vuex/store'
import EmbargoedRequestList from './EmbargoedRequestList.vue'

describe('EmbargoedRequestList.vue', () => {
  let cmp
  let store
  let state

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://api.blackfynn.net'
      },
      userToken: '123'
    }
    store = new Vuex.Store({
      state
    })
    cmp = mount(EmbargoedRequestList, {
      store
    })
    cmp.setData({
      isDialogVisible: false,
      rejectedRequest: {}
    })
    cmp.setProps({
      request: {
        userId: '123',
        firstName: 'Maha',
        lastName: 'Zayed',
        email: 'maha@blackfynn.com',
        status: 'requested'
      }
    })
    cmp.update()
  })

  it('acceptRequest', () => {
    const request = {
      userId: '123',
      firstName: 'Maha',
      lastName: 'Zayed',
      email: 'maha@blackfynn.com',
      status: 'granted'
    }

    cmp.vm.$on('accept-request', payload => {
      expect(payload.request).toEqual(request)
    })
    cmp.vm.acceptRequest(request)
  })

  it('rejectRequest', () => {
    const request = {
      userId: '123',
      firstName: 'Maha',
      lastName: 'Zayed',
      email: 'maha@blackfynn.com',
      status: 'requested'
    }
    cmp.vm.rejectRequest()
    expect(cmp.vm.isDialogVisible).toBe(true)
  })

  it('closeDialog', () => {
    cmp.vm.closeDialog()
    expect(cmp.vm.isDialogVisible).toBe(false)
  })

  it('removeRequest', () => {
    const request = {
      userId: '123',
      firstName: 'Maha',
      lastName: 'Zayed',
      email: 'maha@blackfynn.com',
      status: 'requested'
    }
    cmp.vm.$on('remove-request', payload => {
      expect(payload.request).toEqual(request)
    })
    cmp.vm.removeRequest(request)
  })





})