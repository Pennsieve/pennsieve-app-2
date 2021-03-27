import Vue from 'vue'
import Vuex from 'vuex'
import BfNavigation from './BfNavigation.vue'
import { shallow } from 'vue-test-utils'
import { actions, mutations, getters } from '../../vuex/store'

const state = {
  config: {
    apiUrl: 'https://api.blackfynn.net',
    environment: 'development'
  },
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
  primaryNavOpen: false,
  orgMembers: [
    {
      id: '123',
      email: 'cameron@blackfynn.com',
      firstName: 'Cameron',
      lastName: 'Baney',
      credential: 'Front-end Engineer',
      color: '#B74F6F',
      url: '',
      authyId: 0,
      isSuperAdmin: false,
      isPublisher: true,
      createdAt: '2019-10-31T16:43:44.219502Z',
      updatedAt: '2020-05-07T17:30:24.273276Z',
      preferredOrganization: '1',
      orcid: {
        name: 'Cameron',
        orcid: '0000-0000-0000-0000'
      },
      pennsieveTermsOfService: {
        version: '20181010000000'
      },
      customTermsOfService: [],
      storage: 82833847
    }
  ],
  profile: {
    id: '123',
    email: 'cameron@blackfynn.com',
    firstName: 'Cameron',
    lastName: 'Baney',
    credential: 'Front-end Engineer',
    color: '#B74F6F',
    url: '',
    authyId: 0,
    isSuperAdmin: false,
    isPublisher: true,
    createdAt: '2019-10-31T16:43:44.219502Z',
    updatedAt: '2020-05-07T17:30:24.273276Z',
    preferredOrganization: '1',
    orcid: {
      name: 'Cameron',
      orcid: '0000-0000-0000-0000'
    },
    pennsieveTermsOfService: {
      version: '20181010000000'
    },
    customTermsOfService: [],
    storage: 82833847
  },
  publishers: []
}

describe('BfNavigation.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(BfNavigation, {
      store
    })
  })

  it('hasAdminRights: true', () => {
    expect(cmp.vm.hasAdminRights).toBe(true)
  })

  it('hasAdminRights: false', () => {
    cmp.vm.$store.state.activeOrganization.isAdmin = false
    expect(cmp.vm.hasAdminRights).toBe(false)
  })

  it('activeOrganizationName', () => {
    expect(cmp.vm.activeOrganizationName).toBe('Blackfynn')
  })

  it('activeOrganizationId', () => {
    expect(cmp.vm.activeOrganizationId).toBe(1)
  })

  it('toggleMenu', () => {
    cmp.vm.toggleMenu()
    expect(cmp.vm.primaryNavCondensed).toBe(true)
    cmp.vm.toggleMenu()
    expect(cmp.vm.primaryNavCondensed).toBe(false)
  })

  it('closeMenu', (done) => {
    cmp.vm.closeMenu()
    cmp.vm.$nextTick(() => {
      expect(cmp.vm.$store.state.primaryNavOpen).toBe(false)
      done()
    })
  })
})
