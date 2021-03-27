import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import EditMember from './EditMember.vue'
import EventBus from '../../../utils/event-bus'
import { actions, mutations, getters } from '../../../vuex/store'

describe('EditMember.vue', () => {
  let cmp
  let state
  let store

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
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
    cmp = mount(EditMember, {
      attachToDocument: true,
      store
    })
    cmp.vm.$refs.memberForm.resetFields = () => {}
    fetch.mockResponse('', { status: 200 })
  })

  afterEach(() => {
    EventBus.$off()
  })

  it('onHandleKeyPressed', () => {
    const spy = jest.spyOn(cmp.vm, 'updateMember')
    cmp.vm.$refs.memberForm.validate = () => true
    cmp.vm.onHandleKeyPressed()
    expect(spy).toBeCalled()
  })

  it('createDisplayName(): full name', () => {
    const member = {
      firstName: 'Fynn',
      lastName: 'Blackwell',
      email: 'fblackwell@blackfynn.com'
    }
    const name = cmp.vm.createDisplayName(member)
    expect(name).toBe(`${member.firstName} ${member.lastName}`)
  })

  it('createDisplayName(): email', () => {
    const member = {
      firstName: '',
      lastName: '',
      email: 'fblackwell@blackfynn.com'
    }
    const name = cmp.vm.createDisplayName(member)
    expect(name).toBe(member.email)
  })

  it('closeDialog()', () => {
    const spy = jest.spyOn(cmp.vm.$refs.memberForm, 'resetFields')
    cmp.vm.closeDialog()
    expect(cmp.vm.dialogVisible).toBe(false)
    expect(spy).toBeCalled()
    expect(cmp.vm.member).toMatchObject({})
    expect(cmp.vm.memberDisplayName).toBe('')
  })

  it('handleUpdateOrgMember()', () => {
    const member = {
      firstName: 'Fynn',
      lastName: 'Blackwell',
      email: 'fblackwell@blackfynn.com'
    }
    cmp.vm.handleUpdateOrgMember(member)
    expect(cmp.vm.dialogVisible).toBe(true)
    expect(cmp.vm.member).toMatchObject(member)
    expect(cmp.vm.ruleForm.firstName).toBe(member.firstName)
    expect(cmp.vm.ruleForm.lastName).toBe(member.lastName)
    expect(cmp.vm.ruleForm.email).toBe(member.email)
    expect(cmp.vm.ruleForm.credential).toBe(member.credential)
    expect(cmp.vm.memberDisplayName).toBe(`${member.firstName} ${member.lastName}`)
  })

  it('createUrl', () => {
    const url =cmp.vm.createUrl()
    expect(url).toBe(`https://app.blackfynn.net/organizations/1/members/?api_key=123`)
  })

  it('updateMemberXhr(): member-updated', (done) => {
    cmp.vm.$on('member-updated', () => {
      done()
    })
    const member = {
      firstName: 'Fynn',
      lastName: 'Blackwell',
      email: 'fblackwell@blackfynn.com'
    }
    cmp.vm.handleUpdateOrgMember(member)
    cmp.vm.updateMemberXhr()
  })

  it('updateMemberXhr(): success toast', (done) => {
    EventBus.$on('toast', (evt) => {
      expect(evt.detail.type).toBe('MESSAGE')
      done()
    })
    const member = {
      firstName: 'Fynn',
      lastName: 'Blackwell',
      email: 'fblackwell@blackfynn.com'
    }
    cmp.vm.handleUpdateOrgMember(member)
    cmp.vm.updateMemberXhr()
  })

  it('updateMemberXhr(): error toast', (done) => {
    fetch.mockRejectOnce('', { status: 500 })
    EventBus.$on('toast', (evt) => {
      expect(evt.detail.type).toBe('ERROR')
      done()
    })
    const member = {}
    cmp.vm.handleUpdateOrgMember(member)
    cmp.vm.updateMemberXhr()
  })
})
