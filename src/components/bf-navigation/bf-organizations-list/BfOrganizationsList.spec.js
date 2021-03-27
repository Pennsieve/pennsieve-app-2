import Vue from 'vue'
import Vuex from 'vuex'
import BfOrganizationsList from './BfOrganizationsList.vue'
import { mount } from 'vue-test-utils'
import EventBus from '../../../utils/event-bus'
import { actions, mutations, getters } from '../../../vuex/store'

const state = {
  activeOrganization: {
    isAdmin: true,
    isOwner: false,
    organization: {
      name: 'Blackfynn',
      id: 1
    },
    administrators: [{id: 1}],
    owners: [{id: 5}]
  },
  organizations: [
    {
      organization: {
        name: 'Blackfynn',
        id: 1
      }
    },
    {
      organization: {
        name: 'Mayo Clinic',
        id: 2
      }
    },
    {
      organization: {
        name: 'CHOP',
        id: 3
      }
    }
  ]
}

describe('BfOrganizationsList.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(BfOrganizationsList, {
      attachToDocument: true,
      store
    })
    cmp.setData({
      filterName: 'Blackfynn'
    })
    cmp.update()
  })

  it('filteredOrganizations', () => {
    expect(cmp.vm.filteredOrganizations.length).toBe(1)
  })

  it('onHandleClick: switch-organization event', (done) => {
    EventBus.$on('switch-organization', _ => {
      done()
    })
    cmp.vm.onHandleClick()
  })

  it('onHandleClick: hide-org-list event', (done) => {
    cmp.vm.$on('hide-org-list', _ => {
      done()
    })
    cmp.vm.onHandleClick()
  })

  it('computeActive', () => {
    const isActive = cmp.vm.computeActive(1)
    expect(isActive).toBe(true)
  })
})
