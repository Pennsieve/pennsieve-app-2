import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount } from 'vue-test-utils'
import { state, actions, mutations, getters } from '../../vuex/store'

import ConfirmChanges from './'

describe('Confirm Changes Mixin', () => {
  let cmp
  let store

  beforeEach(() => {
    const TestComponent = Vue.component('TestComponent', {
      mixins: [ConfirmChanges]
    })
    store = new Vuex.Store({
      state: Object.assign({}, state, {userToken: '123'}),
      actions,
      mutations,
      getters
    })
    cmp = mount(TestComponent, {
      attachToDocument: true,
      store,
      methods: {
        onConfirmLossOfChanges: () => {}
      }
    })
  })

  it('onBeforeUnload: no changes', () => {
    const value = cmp.vm.onBeforeUnload({})
    expect(value).toBe(undefined)
  })

  it('onBeforeUnload: has changes', () => {
    cmp.vm.changedProperties = [1]
    const value = cmp.vm.onBeforeUnload({})
    expect(value.length > 0).toBe(true)
  })

  it('confirmLossOfChanges: no changes', () => {
    const spy = jest.spyOn(window, 'confirm')
    cmp.vm.confirmLossOfChanges()
    expect(spy).not.toBeCalled()
  })

  it('confirmLossOfChanges: has changes', () => {
    cmp.vm.changedProperties = [1]
    const spy = jest.spyOn(window, 'confirm')
    cmp.vm.confirmLossOfChanges()
    expect(spy).toBeCalled()
  })

  it('beforeRouteLeaveHandler: has token, no changes', () => {
    const spy = jest.spyOn(cmp.vm, 'confirmLossOfChanges')
    const nextFn = () => {}
    cmp.vm.beforeRouteLeaveHandler('/test', '/', nextFn)
    expect(spy).toBeCalled()
  })

  it('beforeRouteLeaveHandler: has token, has changes', () => {
    cmp.vm.changedProperties = [1]
    const spy = jest.spyOn(cmp.vm, 'confirmLossOfChanges')
    const nextFn = () => {}
    cmp.vm.beforeRouteLeaveHandler('/test', '/', nextFn)
    expect(spy).toBeCalled()
  })

  it('beforeRouteLeaveHandler: no token', () => {
    delete cmp.vm.$store.state.userToken
    const spy = jest.spyOn(cmp.vm, 'confirmLossOfChanges')
    const nextFn = () => {}
    cmp.vm.beforeRouteLeaveHandler('/test', '/', nextFn)
    expect(spy).not.toBeCalled()
  })

  it('destroy', () => {
    const spy = jest.spyOn(window, 'removeEventListener')
    cmp.destroy()
    expect(spy).toBeCalled()
  })
})