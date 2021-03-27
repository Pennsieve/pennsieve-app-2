global.localStorage = {
  setItem: (key, val) => global.localStorage[key] = val,
  getItem: (key) => global.localStorage[key],
  removeItem: (key) => delete global.localStorage[key]
}

import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import ConceptQueryBuilder from './ConceptQueryBuilder.vue'
import { actions, mutations, getters, state } from '../../../../vuex/store'
import flushPromises from 'flush-promises'

describe('ConceptQueryBuilder.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(ConceptQueryBuilder, {
      store
    })
    cmp.setProps({
      concepts: [
        {
          "id": 1,
          "name": "Diseases",
          "description": "",
          "count": 32
        },
        {
          "id": 2,
          "name": "Animals",
          "description": "",
          "count": 3
        },
        {
          "id": 3,
          "name": "Patients",
          "description": "",
          "count": 563
        },
        {
          "id": 4,
          "name": "Studies",
          "description": "",
          "count": 12
        },
        {
          "id": 5,
          "name": "Visits",
          "description": "",
          "count": 2498
        }
      ],
      concept: {
        "id": 4,
        "name": "Studies",
        "description": "",
        "count": 12
      }
    })
    cmp.update()
  })

  it('getRelatedFields', (done) => {
    const schema = [
      {
        name: 'ID',
        dataType: 'Number'
      },
      {
        name: 'Name',
        dataType: 'String'
      }
    ]
    const topology = [
      {
        name: 'Diseases',
        schema
      }
    ]
    fetch.mockResponse(JSON.stringify(schema), {status: 200})
    cmp.vm.getRelatedFields('diseases').then(resp => {
      expect(resp).toMatchObject(schema)
      done()
    })
  })

  it('getSelectedValue', () => {
    const topology = [
      {
        name: 'Diseases',
        schema: [
          {
            value: 'id',
            dataType: 'Number'
          },
          {
            value: 'name',
            dataType: 'String'
          }
        ]
      }
    ]
    const val = cmp.vm.getSelectedValue(topology[0].schema)
    expect(val).toBe('id')
  })

  it('getQueryFilterIndex', () => {
    const index = cmp.vm.getQueryFilterIndex({id: 1})
    expect(index).toBe(0)
  })

  it('handleRelatedFieldsUpdate()', (done) => {
    cmp.vm.topology = [
      {
        name: 'Diseases',
        schema: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ]
      }
    ]
    cmp.vm.handleRelatedFieldsUpdate({
      selectedConcept: 'Diseases'
    })
    flushPromises().then(() => {
      expect(cmp.vm.queryFilters.length).toBe(1)
      expect(cmp.vm.queryFilters[0].relatedFields.length).toBe(2)
      done()
    })
  })

  it('handleUpdateSelectedRelatedField()', () => {
    cmp.vm.queryFilters = [
      {
        selectedConcept: 'Diseases',
        releatedFields: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ],
        selectedRelatedField: 'id'
      }
    ]
    cmp.vm.handleUpdateSelectedRelatedField({
      selectedRelatedField: 'name',
      id: 1
    })
    expect(cmp.vm.queryFilters[0].selectedRelatedField).toBe('name')
  })

  it('handleUpdateSelectedOperator()', () => {
    cmp.vm.queryFilters = [
      {
        selectedConcept: 'Diseases',
        releatedFields: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ],
        selectedRelatedField: 'id',
        selectedOperator: 'eq'
      }
    ]
    cmp.vm.handleUpdateSelectedOperator({
      selectedOperator: 'neq',
      id: 1
    })
    expect(cmp.vm.queryFilters[0].selectedOperator).toBe('neq')
  })

  it('handleUpdateValueToCompare()', () => {
    cmp.vm.queryFilters = [
      {
        selectedConcept: 'Diseases',
        releatedFields: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ],
        selectedRelatedField: 'id',
        selectedOperator: 'eq',
        valueToCompare: ''
      }
    ]
    cmp.vm.handleUpdateValueToCompare({
      valueToCompare: 'test',
      id: 1
    })
    expect(cmp.vm.queryFilters[0].valueToCompare).toBe('test')
  })

  it('addFilter()', (done) => {
    const schema = [
      {
        name: 'Studies',
        schema: [
          {
            value: 'name',
            name: 'Name',
            dataType: 'Number'
          },
          {
            value: 'protocol id',
            name: 'Protocol ID',
            dataType: 'Boolean'
          }
        ]
      }
    ]
    fetch.mockResponseOnce(JSON.stringify(schema), {status: 200})
    cmp.vm.addFilter()
    flushPromises().then(() => {
      expect(cmp.vm.queryFilters.length).toBe(1)
      expect(cmp.vm.queryFilters[0].selectedRelatedField).toBe('Studies')
      done()
    })
  })

  it('handleRemoveFilter(): 1 filter', () => {
    cmp.vm.queryFilters = [
      {
        id: 1,
        selectedConcept: 'Diseases',
        releatedFields: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ],
        selectedRelatedField: 'id',
        selectedOperator: 'eq',
        valueToCompare: ''
      }
    ]
    cmp.vm.handleRemoveFilter(1)
    expect(cmp.vm.displaySearchError).toBe(false)
    expect(cmp.vm.queryFilters.length).toBe(0)
  })

  it('handleRemoveFilter(): More than 1 filter', () => {
    cmp.vm.queryFilters = [
      {
        id: 1,
        selectedConcept: 'Diseases',
        releatedFields: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ],
        selectedRelatedField: 'id',
        selectedOperator: 'eq',
        valueToCompare: '123'
      },
      {
        id: 2,
        selectedConcept: 'Studies',
        releatedFields: [
          {
            name: 'name',
            dataType: 'Number'
          },
          {
            name: 'protocol id',
            dataType: 'Boolean'
          }
        ],
        selectedRelatedField: 'name',
        selectedOperator: 'eq',
        valueToCompare: 'Test'
      }
    ]
    cmp.vm.handleRemoveFilter(2)
    expect(cmp.vm.queryFilters.length).toBe(1)
  })

  it('_buildFilters', () => {
    const filter = {
      id: 2,
      selectedConcept: 'Studies',
      releatedFields: [
        {
          name: 'name',
          dataType: 'Number'
        },
        {
          name: 'protocol id',
          dataType: 'Boolean'
        }
      ],
      selectedRelatedField: 'name',
      selectedOperator: 'eq',
      valueToCompare: 'Test'
    }
    const obj = cmp.vm._buildFilters(filter)
    const expectedObj = {
      key: 'name',
      predicate: {
        operation: 'eq',
        value: 'Test'
      }
    }
    expect(obj).toMatchObject(expectedObj)
  })

  it('_buildJoins', () => {
    const filter = {
      id: 2,
      selectedConcept: 'Studies',
      releatedFields: [
        {
          name: 'name',
          dataType: 'Number'
        },
        {
          name: 'protocol id',
          dataType: 'Boolean'
        }
      ],
      selectedRelatedField: 'name',
      selectedOperator: 'eq',
      valueToCompare: 'Test'
    }
    const obj = cmp.vm._buildJoins(filter)
    const expectedObj = {
      targetType: {
        concept: {
          type: 'Studies'
        }
      },
      filters: [
        {
          predicate: {
            operation: 'eq',
            value: 'Test'
          }
        }
      ]
    }
    expect(obj).toMatchObject(expectedObj)
  })

  it('_buildJoins: package', () => {
    const filter = {
      id: 2,
      selectedConcept: 'package',
      releatedFields: [
        {
          name: 'name',
          dataType: 'Number'
        },
        {
          name: 'package',
          dataType: 'Boolean'
        }
      ],
      selectedRelatedField: 'package',
      selectedOperator: 'eq',
      valueToCompare: 'Test'
    }
    const obj = cmp.vm._buildJoins(filter)
    const expectedObj = {
      targetType: {
        proxy: {
          type: 'package'
        }
      },
      filters: [
        {
          predicate: {
            operation: 'eq',
            value: 'Test'
          }
        }
      ]
    }
    expect(obj).toMatchObject(expectedObj)
  })

  it('validateQueryFilters: false', () => {
    const filters = [
      {
        selectedConcept: 'Diseases',
        releatedFields: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ],
        selectedRelatedField: 'id',
        selectedOperator: 'eq',
        valueToCompare: ''
      }
    ]
    const bool = cmp.vm.validateQueryFilters(filters)
    expect(bool).toBe(false)
  })

  it('validateQueryFilters: true', () => {
    const filters = [
      {
        selectedConcept: 'Diseases',
        releatedFields: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ],
        selectedRelatedField: 'id',
        selectedOperator: 'eq',
        valueToCompare: '123'
      }
    ]
    const bool = cmp.vm.validateQueryFilters(filters)
    expect(bool).toBe(true)
  })

  it('buildQuery(): false', () => {
    const spy = jest.spyOn(cmp.vm, 'autoFocus')
    cmp.vm.queryFilters = [
      {
        selectedConcept: 'Diseases',
        releatedFields: [
          {
            name: 'id',
            dataType: 'Number'
          },
          {
            name: 'name',
            dataType: 'String'
          }
        ],
        selectedRelatedField: 'id',
        selectedOperator: 'eq',
        valueToCompare: ''
      }
    ]
    cmp.vm.buildQuery()
    expect(cmp.vm.displaySearchError).toBe(true)
    expect(spy).toBeCalled()
  })

  it('buildQuery(): true', () => {
    cmp.vm.queryFilters = [
      {
        id: 2,
        selectedConcept: 'Studies',
        releatedFields: [
          {
            name: 'name',
            dataType: 'Number'
          },
          {
            name: 'package',
            dataType: 'Boolean'
          }
        ],
        selectedRelatedField: 'package',
        selectedOperator: 'eq',
        valueToCompare: 'Test'
      }
    ]
    const obj = cmp.vm.buildQuery()
    expect(cmp.vm.displaySearchError).toBe(false)
    const expectedObj = {
      type: {
        concept: {
          type: 'Studies'
        }
      },
      filters: [{
        key: 'package',
        predicate: {
          operation: 'eq',
          value: 'Test'
        }
      }],
      joins: [],
      offset: 0,
      limit: 50
    }
    expect(obj).toMatchObject(expectedObj)
  })
})