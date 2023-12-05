import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import { state, actions, mutations, getters } from '../../vuex/store'
import Analytics from './Analytics'

// mock globals
global.ga = jest.fn(() => {})
// global.heap = {
//   identify: jest.fn(() => {}),
//   addUserProperties: jest.fn((user) => {})
// }

describe('Analytics.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    const organizations = [{organization: {id: 777, name: 'Blackfynn'}}]
    const storeState = Object.assign({}, state, { organizations })
    store = new Vuex.Store({
      state: storeState,
      actions,
      mutations,
      getters
    })
    cmp = mount(Analytics, {
      attachToDocument: true,
      store
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('mounted: ga method called once', () => {
    expect(ga.mock.calls.length).toBe(1)
  })

  it('getBlackfynnId: successfully parses Blackfynn user id', () => {
    const id = 'N:user:4edcd1d9-1b25-4860-abdf-79140d069450'
    const parsedId = cmp.vm.getBlackfynnId(id)
    expect(parsedId).toEqual('4edcd1d9-1b25-4860-abdf-79140d069450')
  })

  it('getBlackfynnId: defaults to empty string when parsing bad Blackfynn user id', () => {
    const parsedId = cmp.vm.getBlackfynnId(null)
    expect(parsedId).toEqual('')
  })

  // it('getUserData: successfully returns user object for Heap analytics', () => {
  //   const evt = {
  //     detail: {
  //       id: 'N:user:4edcd1d9-1b25-4860-abdf-79140d069450',
  //       firstName: 'Ren',
  //       lastName: 'Hoek',
  //       email: 'rhoek@spumco.com',
  //       credential: 'Front-End Engineer',
  //       preferredOrganization: 777
  //     }
  //   }
  //   const userData = cmp.vm.getUserData(evt)
  //   const expectedObject = {
  //     'Blackfynn ID': '4edcd1d9-1b25-4860-abdf-79140d069450',
  //     'First Name': 'Ren',
  //     'Last Name': 'Hoek',
  //     'Email': 'rhoek@spumco.com',
  //     'Title': 'Front-End Engineer',
  //     'Organization': 'Blackfynn'
  //   }
  //   expect(userData).toMatchObject(expectedObject)
  // })

  it('getUserData: returns {} for bad user object', () => {
    const evt = {}
    const userData = cmp.vm.getUserData(evt)
    const expectedObject = {}
    expect(userData).toEqual(expectedObject)
  })

  it('trackPage: fires 3 Google analytics calls if page data is available', () => {
    const evt = {
      detail: {
        path: 'Profile',
        title: 'Team Management'
      }
    }
    cmp.vm.trackPage(evt)
    // 1 called on mounted, 2 subsequent calls from trackPage()
    expect(ga.mock.calls.length).toBe(3);
  })

  it('trackPage: fires 2 Google analytics calls if page data is NOT available', () => {
    const evt = {}
    cmp.vm.trackPage(evt)
    // 1 called on mounted, 1 subsequent call from trackPage()
    expect(ga.mock.calls.length).toBe(2);
  })

  // it('trackUser: fires 2 Heap analytics calls if user data is available', () => {
  //   const evt = {
  //     detail: {
  //       id: 'N:user:4edcd1d9-1b25-4860-abdf-79140d069450',
  //       firstName: 'Ren',
  //       lastName: 'Hoek',
  //       credential: 'Front-End Engineer',
  //       organization: 'Blackfynn'
  //     }
  //   }
  //   cmp.vm.trackUser(evt)
  //   expect(heap.identify.mock.calls.length).toBe(1);
  //   expect(heap.addUserProperties.mock.calls.length).toBe(1);
  // })

  // it('trackUser: fires 0 Heap analytics calls if user data is NOT available', () => {
  //   cmp.vm.trackUser(null)
  //   expect(heap.identify.mock.calls.length).toBe(0);
  //   expect(heap.addUserProperties.mock.calls.length).toBe(0);
  // })
})