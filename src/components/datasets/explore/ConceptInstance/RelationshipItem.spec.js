import Vuex from 'vuex'
import { shallow } from 'vue-test-utils'
import RelationshipItem from './RelationshipItem.vue'
import { actions, mutations, getters, state } from '../../../../vuex/store'

describe('RelationshipItem.vue', () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = shallow(RelationshipItem, {
      store
    })
    cmp.setProps({
      item: {
        name: 'Test'
      },
      index: 0,
      relatedFields: [
        {id: 1, name: 'ID', value: 'id'},
        {id: 2, name: 'Name', value: 'name'}
      ],
      relatedFieldsValue: ''
    })
    cmp.update()
  })

  it('isFirst(): false', () => {
    const first = cmp.vm.isFirst(2)
    expect(first).toBe(false)
  })

  it('isFirst(): true', () => {
    const first = cmp.vm.isFirst(0)
    expect(first).toBe(true)
  })

  it('updateRelatedFieldsValue(): update all relationships', (done) => {
    const val = 'id'
    cmp.vm.$on('update-all-relationships', (payload) => {
      expect(payload).toBe(val)
      done()
    })
    cmp.vm.updateRelatedFieldsValue(val)
    expect(cmp.vm.relatedFieldsModel).toBe(val)
  })

  // it('updateRelatedFieldsValue(): update a single relationship', (done) => {
  //   cmp.setProps({
  //     item: {
  //       name: 'Test'
  //     },
  //     index: 0,
  //     relatedFields: [
  //       {id: 1, name: 'ID', value: 'id'},
  //       {id: 2, name: 'Name', value: 'name'}
  //     ],
  //     relatedFieldsValue: 'something'
  //   })
  //   cmp.update()
  //   const val = 'id'
  //   const obj = {
  //     selectedValue: val,
  //     name: 'Test'
  //   }
  //   cmp.vm.$on('update-relationship', (payload) => {
  //     expect(payload).toMatchObject(obj)
  //     done()
  //   })
  //   cmp.vm.updateRelatedFieldsValue(val)
  //   expect(cmp.vm.relatedFieldsModel).toBe(val)
  // })
})