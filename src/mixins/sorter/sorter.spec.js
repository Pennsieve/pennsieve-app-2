import Vue from 'vue'
import { shallow } from 'vue-test-utils'
import EventBus from '../../utils/event-bus'
import Sorter from './'

describe('sorter Mixin', () => {
  let cmp

  beforeEach(() => {
    const test = Vue.component('test', {
      mixins: [
        Sorter
      ]
    })
    cmp = shallow(test)
  })

  afterEach(() => {
    EventBus.$off('sorted')
  })

  it('isSorting()', () => {
    const firstName = cmp.vm.isSorting('firstName')
    expect(firstName).toBe(false)
    const name = cmp.vm.isSorting('name')
    expect(name).toBe(true)
  })

  it('setSorting()', () => {
    const ref = cmp.vm
    ref.setSortDirection('name')
    expect(ref.sortDirection).toBe('asc')

    ref.setSortDirection('name')
    expect(ref.sortDirection).toBe('desc')

    ref.sortBy = 'lastName'
    ref.setSortDirection('lastName')
    expect(ref.sortDirection).toBe('asc')

    ref.sortBy = 'name'
    ref.setSortDirection('name', 'desc')
    expect(ref.sortDirection).toBe('desc')
  })

  it('setSort(): descending order', (done) => {
    EventBus.$on('sorted', (sortedList) => {
      expect(sortedList[0].lastName).toBe('Cat')
      done()
    })
    const ref = cmp.vm
    const list = [
      {id: 1, firstName: 'Ren', lastName: 'Hoek'},
      {id: 2, firstName: 'Stimpy', lastName: 'Cat'},
    ]
    ref.setSort('lastName', list)
    expect(ref.sortBy).toBe('lastName')
  })

  it('setSort(): ascending order', (done) => {
    EventBus.$on('sorted', (sortedList) => {
      expect(sortedList[0].name).toBe('Stimpy Cat')
      done()
    })
    const ref = cmp.vm
    ref.sortDirection = 'asc'
    const list = [
      {id: 1, name: 'Ren Hoek'},
      {id: 2, name: 'Stimpy Cat'},
    ]
    ref.setSort('name', list)
  })

  it('setSort(): path support', (done) => {
    EventBus.$on('sorted', (sortedList) => {
      expect(sortedList[0].team.name).toBe('Justice League')
      done()
    })
    const list = [
      {team: { id: 1, name: 'Spumco'}},
      {team: {id: 2, name: 'Justice League'}},
    ]
    cmp.vm.setSort('team.name', list)
  })

  it('returnSort(): descending order', () => {
   const ref = cmp.vm
    const list = [
      {id: 1, firstName: 'Ren', lastName: 'Hoek'},
      {id: 2, firstName: 'Stimpy', lastName: 'Cat'},
    ]
    const sortedList = ref.returnSort('lastName', list)
    expect(ref.sortBy).toBe('lastName')
    expect(sortedList[0].lastName).toBe('Cat')
  })

  it('returnSort(): ascending order', () => {
    const ref = cmp.vm
    ref.sortDirection = 'asc'
    const list = [
      {id: 1, name: 'Ren Hoek'},
      {id: 2, name: 'Stimpy Cat'},
    ]
    const sortedList = ref.returnSort('name', list)
    expect(sortedList[0].name).toBe('Stimpy Cat')
  })

  it('returnSort(): path support', () => {
    const list = [
      {team: { id: 1, name: 'Spumco', storage: 456}},
      {team: {id: 2, name: 'Justice League', storage: 123}},
    ]
    const sortedList = cmp.vm.returnSort('team.storage', list)
    expect(sortedList[0].team.storage).toBe(123)
  })

  it('sortIcon', () => {
    const sortIconDesc = cmp.vm.sortIcon('name')
    expect(sortIconDesc).toBe('icon-sort-desc')

    cmp.vm.sortDirection = 'asc'
    const sortIconAsc = cmp.vm.sortIcon('lastName')
    expect(sortIconAsc).toBe('icon-sort-asc')
  })

  it('onTableSort: empty property', () => {
    const spy = jest.spyOn(cmp.vm, '$emit')
    cmp.vm.onTableSort('')
    expect(spy).not.toBeCalled()
  })

  it('onTableSort: valid property', (done) => {
    cmp.vm.$on('set-table-sort', () => done())
    cmp.vm.onTableSort('kind')
  })
})