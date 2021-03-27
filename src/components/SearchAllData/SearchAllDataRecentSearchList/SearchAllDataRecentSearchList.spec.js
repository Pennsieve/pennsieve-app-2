import { mount } from 'vue-test-utils'

import SearchAllDataRecentSearchList from './SearchAllDataRecentSearchList.vue'

describe('SearchAllDataRecentSearchList.vue', () => {
  let cmp

  beforeEach( () => {
    cmp = mount(SearchAllDataRecentSearchList)
    cmp.setProps({recentSearches: [] })
  })

  it('Does not display searches', () => {
    const heading = cmp.find('h2')
    expect(heading.exists()).toBe(false)
  })
})
