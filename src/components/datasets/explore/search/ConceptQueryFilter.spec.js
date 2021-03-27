import Vuex from 'vuex'
import moment from 'moment'
import { shallow } from 'vue-test-utils'
import ConceptQueryFilter from './ConceptQueryFilter.vue'
import { actions, mutations, getters, state } from '../../../../vuex/store'

describe('ConceptQueryFilter.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(ConceptQueryFilter, {
      store
    })
  })

  it('Renders filter menus: text value', () => {
    cmp.setProps({
      selectedConcept: 'Animal',
      concepts: [
        {
          name: 'Animal',
          value: 'Animal'
        },
        {
          name: 'Study',
          value: 'Study'
        }
      ],
      selectedRelatedField: 'ID',
      relatedFields: [
        {
          name: 'ID',
          value: 'ID',
          dataType: 'Number'
        },
        {
          name: 'Name',
          value: 'Name',
          dataType: 'String'
        }
      ],
      selectedOperator: 'neq',
      id: 0,
      valueToCompare: 'Test',
    })
    expect(cmp.vm.conceptValue).toBe('Animal')
    expect(cmp.vm.relatedFieldsValue).toBe('ID')
    expect(cmp.vm.inputValue).toBe('Test')
    expect(cmp.vm.operatorValue).toBe('neq')
    expect(cmp.vm.id).toBe(0)
  })

  it('setDefaultInputValue: date', () => {
    cmp.setProps({
      selectedRelatedField: 'Date',
      relatedFields: [
        {
          name: 'ID',
          value: 'ID',
          dataType: 'Number'
        },
        {
          name: 'date',
          value: 'Date',
          dataType: 'Date'
        }
      ],
    })
    const val = cmp.vm.setDefaultInputValue()
    const defaultDate = moment().format('YYYY-MM-DDTHH:mm:ss.00+0000')
    expect(val).toBe(defaultDate)
  })

  it('setDefaultInputValue: boolean', () => {
    cmp.setProps({
      selectedRelatedField: 'Truthy',
      relatedFields: [
        {
          value: 'ID',
          name: 'ID',
          dataType: 'Number'
        },
        {
          value: 'Truthy',
          name: 'truthy',
          dataType: 'Boolean'
        }
      ],
    })
    const val = cmp.vm.setDefaultInputValue()
    expect(val).toBe(true)
  })

  it('Handles concepts change event', (done) => {
    cmp.vm.$on('update-related-fields', (payload) => {
      expect(payload.selectedConcept).toBe(cmp.vm.conceptValue)
      expect(payload.id).toBe(cmp.vm.id)
      done()
    })
    const menu = cmp.find('.conceptMenu')
    menu.trigger('change')
  })

  it('Handles remove concept filter event', (done) => {
    cmp.vm.$on('remove-concept-filter', (id) => {
      expect(id).toBe(cmp.vm.id)
      done()
    })
    const btn = cmp.find('#removeFilterButton')
    btn.trigger('click')
  })

  it('Handles update-selected-related-field event', (done) => {
    cmp.vm.$on('update-selected-related-field', (obj) => {
      expect(obj.id).toBe(cmp.vm.id)
      done()
    })
    cmp.vm.updateSelectedRelatedField()
  })

  it('Handles update-selected-operator event', (done) => {
    cmp.vm.$on('update-selected-operator', (obj) => {
      expect(obj.id).toBe(cmp.vm.id)
      done()
    })
    cmp.vm.updateSelectedOperator()
  })

  it('Handles update-value-to-compare event', (done) => {
    cmp.vm.$on('update-value-to-compare', (obj) => {
      expect(obj.id).toBe(cmp.vm.id)
      done()
    })
    cmp.vm.updateValueToCompare()
  })
})