import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import ConceptSearch from './ConceptSearch.vue'
import EventBus from '../../../../utils/event-bus'
import { actions, mutations, getters, state } from '../../../../vuex/store'

const $route = {
  params: {
    datasetId: 123,
    conceptId: '1'
  }
}

describe('ConceptSearch.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    const concepts = [
      {id: '1', name: 'Diseases', description: '', count: 32},
      {id: '2', name: 'Animals', description: '', count: 3},
      {id: '3', name: 'Patients', description: '', count: 563},
      {id: '4', name: 'Studies', description: '', count: 12},
      {id: '5', name: 'Visits', description: '', count: 2498}
    ]
    const updatedState = Object.assign({userToken: 123}, state, { concepts })
    store = new Vuex.Store({
      state: updatedState,
      actions,
      mutations,
      getters
    })
    cmp = shallow(ConceptSearch, {
      store,
      mocks: {
        $route
      }
    })
  })

  it('getConceptId', () => {
    const conceptId = cmp.vm.getConceptId($route)
    expect(conceptId).toBe('1')
  })

  it('getConcept', () => {
    cmp.vm.getConcept()
    expect(cmp.vm.concept).toMatchObject(cmp.vm.concepts[0])
  })

  it('createSearchUrl: fail', () => {
    cmp.vm.$store.state.userToken = null
    const url = cmp.vm.createSearchUrl()
    expect(url).toBe(undefined)
  })

  it('createSearchUrl: success', () => {
    const url = cmp.vm.createSearchUrl('run')
    expect(url.indexOf('run') >= 0).toBe(true)
  })

  it('handleUpdateConceptSearch: bad url', () => {
    const fn = cmp.vm.handleUpdateConceptSearch()
    expect(fn).toBe(undefined)
  })

  // it('handleUpdateConceptSearch(): success', (done) => {
  //   cmp.vm.$store.state.userToken = 456
  //   const results = []
  //   fetch.mockResponseOnce(JSON.stringify(results), {status: 200})
  //   cmp.vm.handleUpdateConceptSearch()
  //   flushPromises().then(() => {
  //     done()
  //   })
  // })

  // it('handleUpdateConceptSearch(): xhr failure', (done) => {
  //   cmp.vm.$store.state.userToken = 456
  //   fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 500})
  //   EventBus.$on('ajaxError', () => {
  //     done()
  //   })
  //   cmp.vm.handleUpdateConceptSearch()
  // })

})