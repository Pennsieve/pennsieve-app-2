import { mount } from 'vue-test-utils'

import SearchAllDataRecentSearch from './SearchAllDataRecentSearch.vue'

describe('SearchAllDataRecentSearch.vue', () => {
  let cmp
  const search = {
    "date": 1576167651328,
    "model": "Activation Procedure",
    "filters": [
      {
        "id": "2e623060-1c36-11ea-b492-fbe00ef5fe45",
        "type": "dataset",
        "target": "N:dataset:10e8462a-ab2e-4a83-8d19-7f2dc52275af",
        "targetLabel": "aaa-testDataset",
        "property": "name",
        "propertyLabel": "Name",
        "propertyType": "",
        "operation": "equal",
        "operationLabel": "is equal to",
        "value": "123123"
      },
      {
        "id": "322998a0-1c36-11ea-b492-fbe00ef5fe45",
        "type": "model",
        "target": "c800feeb-b8d7-4d7f-8cdf-5b8716587875",
        "targetLabel": "Location",
        "property": "name",
        "propertyLabel": "Name",
        "propertyType": "String",
        "operation": "equal",
        "operationLabel": "is equal to",
        "value": "ffff"
      }
    ]
  }

  beforeEach( () => {
    cmp = mount(SearchAllDataRecentSearch)
    cmp.setProps({search: search })
  })

  it('Properly Formats date', () => {
    const searchText = cmp.find('.search-all-data-recent-search-date')
    expect(searchText.text()).toBe('December 12, 2019')
  })
})
