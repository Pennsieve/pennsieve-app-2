import Vue from 'vue'
import { shallow } from 'vue-test-utils'

import uniqueNames from './'

describe('check-unique-names Mixin', () => {
  let cmp

  beforeEach(() => {
    const TestComponent = Vue.component('test', {
      mixins: [
        uniqueNames
      ]
    })
    cmp = shallow(TestComponent)
  })

  it('checkUniqueName: is unique', () => {
    const datasets = [
      {content: {name: 'ABC'}},
      {content: {name: 'DEF'}},
      {content: {name: 'GHI'}},
      {content: {name: 'JKL'}}
    ]
    const bool = cmp.vm.checkUniqueName(datasets, ['content', 'name'], 'XYZ')
    expect(bool).toBe(true)
  })

  it('checkUniqueName: is unique, case sensitive', () => {
    const datasets = [
      {content: {name: 'ABC'}},
      {content: {name: 'DEF'}},
      {content: {name: 'GHI'}},
      {content: {name: 'JKL'}}
    ]
    const bool = cmp.vm.checkUniqueName(datasets, ['content', 'name'], 'XYZ', false)
    expect(bool).toBe(true)
    const sameName = cmp.vm.checkUniqueName(datasets, ['content', 'name'], 'abc', false)
    expect(sameName).toBe(false)
  })

  it('checkUniqueName: is unique, exclude', () => {
    const datasets = [
      {content: {name: 'ABC'}},
      {content: {name: 'DEF'}},
      {content: {name: 'GHI'}},
      {content: {name: 'JKL'}}
    ]
    const bool = cmp.vm.checkUniqueName(datasets, ['content', 'name'], 'XYZ', 'MNO')
    expect(bool).toBe(true)
  })

  it('checkUniqueName: is not unique', () => {
    const datasets = [
      {content: {name: 'ABC'}},
      {content: {name: 'DEF'}},
      {content: {name: 'GHI'}},
      {content: {name: 'JKL'}}
    ]
    const bool = cmp.vm.checkUniqueName(datasets, ['content', 'name'], 'DEF')
    expect(bool).toBe(false)
  })

  it('checkUniqueName: is not unique, exclude', () => {
    const datasets = [
      {content: {name: 'ABC'}},
      {content: {name: 'DEF'}},
      {content: {name: 'GHI'}},
      {content: {name: 'JKL'}}
    ]
    const bool = cmp.vm.checkUniqueName(datasets, ['content', 'name'], 'DEF', 'ABC')
    expect(bool).toBe(false)
  })
})
