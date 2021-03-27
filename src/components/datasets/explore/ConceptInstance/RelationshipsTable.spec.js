import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
// import RelationshipsTable from './RelationshipsTable.vue'
import { state, actions, mutations, getters } from '../../../../vuex/store'

// NOTE: Vue Intersect is causing this test to fail, will add back in once issue
// has been resolved. babel-plugin-transform-es2015-modules-commonjs doesn't seem to
// be processing vue-intersect
describe.skip('RelationshipsTable.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    let cmp
    let store

    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })

    cmp = shallow(RelationshipsTable, {
      store
    })
  })

  it('formatResults(): formats the API Response', () => {
    const data = [
      [
        {
          createdAt: "2018-04-30T19:38:46.622+0000",
          createdBy: "N:user:2e4e659b-729c-4510-9918-40807105e3fb",
          from: "62b181a8-975b-99ae-c9f0-3ff52263dd0e",
          id: "50b18c08-43f1-5d74-5e55-b71dc4ea7a9f",
          schemaRelationshipId: "fcf826e4-36de-44cc-b87d-d3100996cae6",
          to: "00b181c0-d6e8-2ffb-f474-b705d8ee8815",
          type: "part_of",
          updatedAt: "2018-04-30T19:38:46.622+0000",
          updatedBy: "N:user:2e4e659b-729c-4510-9918-40807105e3fb",
          values: []
        },
        {
          createdAt: "2018-04-26T19:50:20.367+0000",
          createdBy: "N:user:2e4e659b-729c-4510-9918-40807105e3fb",
          id: "00b181c0-d6e8-2ffb-f474-b705d8ee8815",
          type: "more_coffee",
          updatedBy: "2018-04-26T19:50:20.367+0000",
          values: [
            {
              conceptTitle: true,
              dataType: "String",
              default: true,
              displayName: "Name",
              locked: false,
              name: "name",
              value: "Dark Roast"
            },
            {
              conceptTitle: false,
              dataType: "Date",
              default: true,
              displayName: "Date",
              locked: false,
              name: "date",
              value: "2018-04-26T19:50:20.367+0000"
            }
          ]
        }
      ]
    ]

    const expectedResult = [
      {
        name: "Dark Roast",
        createdAt: "April 30, 2018"
      }
    ]
  })

  expect(cmp.vm.formatResults(data).toEqual(expectedResult))
})