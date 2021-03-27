import ConceptSearchResults from './ConceptSearchResults.vue'
import { shallow } from 'vue-test-utils'
import Vuex from 'vuex'
import { state, getters } from '@/vuex/store'

describe('ConceptSearchResults.vue', () => {
  let cmp

  beforeEach(() => {
    const store = new Vuex.Store({
      state,
      getters
    })
    cmp = shallow(ConceptSearchResults, {
      store
    })
  })

  it('getHeadings(): good data', () => {
    cmp.setProps({
      results: [{
        values: [
          {displayName: 'Gender', name: 'gender', value: 'Male', conceptTitle: false, default: true},
          {displayName: 'Notes', name: 'notes', value: 'Increase dosage', conceptTitle: true}
        ]
      }]
    })
    cmp.update()
    const headings = cmp.vm.getHeadings(cmp.vm.results, ['createdAt'])
    expect(headings).toMatchObject(['Notes', 'Gender'])
  })

  it('getHeadings(): bad data', () => {
    cmp.setProps({
      results: []
    })
    cmp.update()
    const headings = cmp.vm.getHeadings(cmp.vm.results)
    expect(headings).toMatchObject([])
  })
})
