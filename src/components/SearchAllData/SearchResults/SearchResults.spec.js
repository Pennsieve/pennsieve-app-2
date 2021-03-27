import SearchResults from './SearchResults.vue'
import { mount } from 'vue-test-utils'
import Vuex from 'vuex'
import { state, getters } from '../../../vuex/store.js'
import flushPromises from 'flush-promises'


describe('SearchResults.vue', () => {
  let cmp
  let store
  let testState

  beforeEach( () => {
    testState = {
      ...state,
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      userToken: '123',
      activeOrganization: {
        organization: {
          name: 'Hells Angels',
          intId: 12345
        }
      }
    }
    store = new Vuex.Store({
      state: testState,
      getters
     })
    cmp = mount(SearchResults, {
      store
    })
  })

  it('Displays no search results to display', () => {
    cmp.setData({ fileResults: [], recordResults: []})
    expect(cmp.vm.noResultsFound).toBe(true)
  })

  it('Displays search results for records and files', () => {
    cmp.setData({ fileResults: ['test123'], recordResults: ['test123']})
    expect(cmp.vm.noResultsFound).toBe(false)
  })

  it('Displays search results for files but not records', () => {
    cmp.setData({ fileResults: ['test123'], recordResults: []})
    expect(cmp.vm.isRecordsButtonDisabled).toBe(true)
    expect(cmp.vm.selectedButton).toEqual('Files')
  })

  it('Displays search results for records but not files', () => {
    cmp.setData({ fileResults: [], recordResults: ['test123']})
    expect(cmp.vm.isFilesButtonDisabled).toBe(true)
    // expect(cmp.vm.selectedButton).toEqual('Records')
  })

  it('Selects multiple files if multiple files are selected in the files table', () => {
    cmp.setData({ selectedFiles: ['test123', 'test456']})
    expect(cmp.vm.multipleSelected).toBe(true)
  })

  it('Assigns a value to selected files based on selection', () => {
    const selected = ['test123', 'test456', 'test789']
    cmp.setData({ selectedFiles: selected})
    expect(cmp.vm.selectedFiles).toEqual(selected)
  })

  it('Updates a file search limit based on pagination selection', () => {
    cmp.setData({ tableSearchParams: {limit: 25, offset: 0}})
    cmp.vm.updateTableSearchLimit(50)
    expect(cmp.vm.tableSearchParams.limit).toEqual(50)
  })

  it('Updates the pagination offset', () => {
    cmp.setData({ tableSearchParams: {limit: 25, offset: 0}})
    cmp.vm.onPaginationPageChange(3)
    expect(cmp.vm.tableSearchParams.offset).toEqual(50)
  })

  it('Returns correct recordsUrl', () => {
    cmp.setData({ tableSearchParams: {limit: 25, offset: 0}})
    const expectedUrl = 'https://app.blackfynn.net/models/v2/organizations/12345/search/records?limit=25&offset=0'
    const recordsUrl = cmp.vm.getRecordsUrl
    expect(recordsUrl).toEqual(expectedUrl)
  })

  it('Returns correct filesUrl', () => {
    cmp.setData({ tableSearchParams: {limit: 25, offset: 0}})
    const expectedUrl = 'https://app.blackfynn.net/models/v2/organizations/12345/search/packages?limit=25&offset=0'
    const filesUrl = cmp.vm.getFilesUrl
    expect(filesUrl).toEqual(expectedUrl)
  })

  it('Fetches file table results', () => {
    // @TODO
  })

  it('Fetches record table results', () => {
    // @TODO
  })

  it('Paginates between a set number of search results for files', () => {
    // @TODO
  })

  it('Downloads a selected file', () => {
    // @TODO
  })







  /**
   * Test Scenarios:
   * 1. If there are no search results, display a no search results blurb
   * 2. If there are search results, you will see a Records and Files button row to choose from
   * 3. If there are Files but no Records and vice versa, one button or the other will be disabled
   * 4. If there are Files and Records, you will see a Files and Records table respectively
   *  Files:
   *  a) Can paginate between results and can view a certain number of results (25, 50, 100)
   *  b) Can download a selected file
   *  c) Can view file details page
   *  d) Can view file in correct folder location
   *  e) Can copy a selected file to another location
   */
})
