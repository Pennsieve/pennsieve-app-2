import RecordsTable from './RecordsTable.vue'
import { mount } from 'vue-test-utils'


describe('RecordsTable.vue', () => {
  let cmp

  beforeEach( () => {
    cmp = mount(RecordsTable)
  })

  it('Sets the new sort order and property', () => {
    // TODO add test logic when sorting works
  })

  it('searchAllDataMenu: true', () => {
    const searchAllDataMenu = true
    cmp.setProps({
      searchAllDataMenu
    })
    cmp.update()
    expect(cmp.vm.searchAllDataMenu).toBe(true)
  })

  it('searchAllDataRecords: true', () => {
    const searchAllDataRecords = true
    cmp.setProps({
      searchAllDataRecords
    })
    cmp.update()
    expect(cmp.vm.searchAllDataRecords).toBe(true)
  })

  it('has table headings', () => {
    const headings = [
      {
        name: 'heading1'
      },
      {
        name: 'heading2'
      },
      {
        name: 'heading3'
      }
    ]
    cmp.setProps({
      headings
    })
    cmp.update()
    expect(cmp.vm.headings).toBe(headings)
  })

  it('has table data', () => {
    const data = {
      models: [{
        id: '123',
        properties: [
          {
            name: 'test123'
          }
        ]
      }],
      records: [
        {
          model_id: '123',
          id: '456',
          values: {
            test123: 'data value here'
          }
        }
      ]
    }
    cmp.setProps({
      data
    })
    cmp.update()
    expect(cmp.vm.data).toEqual(data)
  })

  /***
   * Test Scenarios:
   *
   * 1. Test that the records data exists
   * 2. Test the menu functionality for each record data
   * etc
   */

})