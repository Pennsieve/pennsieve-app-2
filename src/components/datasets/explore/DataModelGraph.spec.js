import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import DataModelGraph from './DataModelGraph.vue'
import { state, actions, mutations, getters } from '../../../vuex/store'

const rawData = [
  {
    "name": "chemical_in_solution",
    "displayName": "chemical_in_solution",
    "description": "chemical_in_solution",
    "createdBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
    "updatedBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
    "locked": false,
    "id": "10265645-105f-4bf8-bfaf-b823b6bd958c",
    "count": 3,
    "createdAt": "2018-04-23T15:54:54.000+0000",
    "updatedAt": "2018-04-23T15:54:54.000+0000"
  },
  {
    "name": "vocabulary_term",
    "displayName": "vocabulary_term",
    "description": "vocabulary_term",
    "createdBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
    "updatedBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
    "locked": false,
    "id": "39047a16-300f-44d8-b58d-0d9a9c6dcbfe",
    "count": 8,
    "createdAt": "2018-04-23T15:54:54.000+0000",
    "updatedAt": "2018-04-23T15:54:54.000+0000"
  },
  {
    "from": "39047a16-300f-44d8-b58d-0d9a9c6dcbfe",
    "to": "10265645-105f-4bf8-bfaf-b823b6bd958c",
    "relationshipType": "schemaRelationship",
    "count": 1,
    "createdAt": "2018-04-23T15:54:54.000+0000",
    "updatedAt": "2018-04-23T15:54:54.000+0000",
    "id": "67e521db-e007-43b8-ac83-7754ec12034d",
    "type": "schemaRelationship"
  },
]

describe('DataModelGraph.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(DataModelGraph, {
      attachToDocument: true,
      store
    })
    cmp.setData({
      active: false,
      hasData: true
    })
  })

  it('Renders inactive message by default', () => {
    expect(cmp.contains('.enable-chart-wrapper')).toBe(true)
  })

  it('Activates the chart', () => {
    const activateChartSpy = jest.spyOn(cmp.vm, 'activateChart')
    const message = cmp.find('.enable-chart-wrapper')
    expect(cmp.vm.active).toBe(false)

    message.trigger('click')

    cmp.vm.$nextTick(() => {
      expect(activateChartSpy).toBeCalled()
      expect(cmp.vm.active).toBe(true)
      expect(cmp.contains('.enable-chart-wrapper')).toBe(false)
    })
  })

  it('Transforms the API Response', () => {
    const { nodes, edges } = cmp.vm.transformApiResponse(rawData)

    const expectedResult = {
      nodes: [
        {
          "name": "chemical_in_solution",
          "displayName": "chemical_in_solution",
          "description": "chemical_in_solution",
          "createdBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
          "updatedBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
          "locked": false,
          "id": "10265645-105f-4bf8-bfaf-b823b6bd958c",
          "count": 3,
          "createdAt": "2018-04-23T15:54:54.000+0000",
          "updatedAt": "2018-04-23T15:54:54.000+0000"
        },
        {
          "name": "vocabulary_term",
          "displayName": "vocabulary_term",
          "description": "vocabulary_term",
          "createdBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
          "updatedBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
          "locked": false,
          "id": "39047a16-300f-44d8-b58d-0d9a9c6dcbfe",
          "count": 8,
          "createdAt": "2018-04-23T15:54:54.000+0000",
          "updatedAt": "2018-04-23T15:54:54.000+0000"
        }
      ],
      edges: [
        {
          "from": "39047a16-300f-44d8-b58d-0d9a9c6dcbfe",
          "to": "10265645-105f-4bf8-bfaf-b823b6bd958c",
          "source": "39047a16-300f-44d8-b58d-0d9a9c6dcbfe",
          "target": "10265645-105f-4bf8-bfaf-b823b6bd958c",
          "relationshipType": "schemaRelationship",
          "count": 1,
          "createdAt": "2018-04-23T15:54:54.000+0000",
          "updatedAt": "2018-04-23T15:54:54.000+0000",
          "id": "67e521db-e007-43b8-ac83-7754ec12034d",
          "type": "schemaRelationship"
        },
      ]
    }

    expect({ nodes, edges }).toEqual(expectedResult)
  })

  it('Formats data', () => {
    const { nodes, edges } = cmp.vm.transformApiResponse(rawData)
    const data = cmp.vm.formatData(edges, nodes)

    const expectedResult = {
      nodes: [
        {
          "name": "chemical_in_solution",
          "displayName": "chemical_in_solution",
          "description": "chemical_in_solution",
          "createdBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
          "updatedBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
          "locked": false,
          "id": "10265645-105f-4bf8-bfaf-b823b6bd958c",
          "count": 3,
          "createdAt": "2018-04-23T15:54:54.000+0000",
          "updatedAt": "2018-04-23T15:54:54.000+0000",
          "active": false
        },
        {
          "name": "vocabulary_term",
          "displayName": "vocabulary_term",
          "description": "vocabulary_term",
          "createdBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
          "updatedBy": "N:user:b741d1c0-fbb4-4da5-9717-e56533f8780a",
          "locked": false,
          "id": "39047a16-300f-44d8-b58d-0d9a9c6dcbfe",
          "count": 8,
          "createdAt": "2018-04-23T15:54:54.000+0000",
          "updatedAt": "2018-04-23T15:54:54.000+0000",
          "active": false
        }
      ],
      edges: [
        {
          "from": "39047a16-300f-44d8-b58d-0d9a9c6dcbfe",
          "to": "10265645-105f-4bf8-bfaf-b823b6bd958c",
          "source": "39047a16-300f-44d8-b58d-0d9a9c6dcbfe",
          "target": "10265645-105f-4bf8-bfaf-b823b6bd958c",
          "relationshipType": "schemaRelationship",
          "count": 1,
          "createdAt": "2018-04-23T15:54:54.000+0000",
          "updatedAt": "2018-04-23T15:54:54.000+0000",
          "id": "67e521db-e007-43b8-ac83-7754ec12034d",
          "type": "schemaRelationship",
          "active": false
        },
      ]
    }

    expect(data).toEqual(expectedResult)
  })
})
