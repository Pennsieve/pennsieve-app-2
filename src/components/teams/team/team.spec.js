import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import { actions, mutations, getters } from '../../../vuex/store'
import Team from './Team.vue'
import EventBus from '../../../utils/event-bus'

const $router = {
  push: jest.fn(() => {})
}

describe('Team.vue', () => {
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
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(Team, {
      attachToDocument: true,
      mocks: {
        $router
      },
      store
    })
    cmp.setProps({
      item: {
        team: {
          id: 1,
          name: 'Iggles'
        },
        memberCount: 11
      }
    })
    cmp.update()
  })

  afterEach(() => {
    EventBus.$off()
  })

  it('memberCount: singular', () => {
    cmp.setProps({
      item: {
        team: {
          id: 1,
          name: 'Iggles'
        },
        memberCount: 1
      }
    })
    cmp.update()
    expect(cmp.vm.memberCount).toBe('1 Member')
  })

  it('memberCount: plural', () => {
    expect(cmp.vm.memberCount).toBe('11 Members')
  })

  it('createTeamId', () => {
    const ref = cmp.vm
    const id = cmp.vm.createTeamId(cmp.vm.item)
    expect(id).toBe(1)
  })

  it('changeRoute', () => {
    const spy = jest.spyOn(cmp.vm.$router, 'push')
    cmp.vm.changeRoute(cmp.vm.item)
    expect(spy).toBeCalled()
  })

  it('openDeleteDialog', (done) => {
    const team = {
      team: {
        id: 1,
        name: 'Iggles'
      }
    }
    EventBus.$on('open-remove-team', data => {
      expect(data).toMatchObject(team)
      done()
    })
    cmp.vm.openDeleteDialog(team)
  })

  it('openDeleteDialog: remove from list', (done) => {
    const team = {
      team: {
        id: 1,
        name: 'Iggles'
      }
    }
    cmp.setProps({
      removeFromList: true
    })
    cmp.update()
    cmp.vm.$on('remove-team-from-list', data => {
      expect(data).toMatchObject(team)
      done()
    })
    cmp.vm.openDeleteDialog(team)
  })

  it('onTeamMenu: valid function', () => {
    const spy = jest.spyOn(cmp.vm, 'openDeleteDialog')
    cmp.vm.onTeamMenu('openDeleteDialog')
    expect(spy).toBeCalled()
  })

  it('onTeamMenu: invalid function', () => {
    const spy = jest.spyOn(cmp.vm, 'openDeleteDialog')
    cmp.vm.onTeamMenu('openDeleteDialog2')
    expect(spy).not.toBeCalled()
  })
})
