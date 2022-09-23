import Vue from 'vue'
import { shallow } from 'vue-test-utils'

import sanitizer from './'

describe('Sanitize Name Mixin', () => {
  const orig = 'abc'
  let cmp

  beforeEach(() => {
    const TestComponent = Vue.component('test', {
      mixins: [sanitizer]
    })
    cmp = shallow(TestComponent)
  })

  it('Does not need to be sanitized', () => {
    const str = cmp.vm.sanitizeName(orig)
    expect(orig).toBe(str)
    expect(cmp.vm.containsReservedChars(orig)).toBe(false)
  })

  it('Needs to be sanitized', () => {
    const str1 = '.abc'
    const sanitizedStr1 = cmp.vm.sanitizeName(str1)
    expect(orig).toBe(sanitizedStr1)
    expect(cmp.vm.containsReservedChars(str1)).toBe(true)

    const str2 = 'abc?'
    const sanitizedStr2 = cmp.vm.sanitizeName(str2)
    expect(orig).toBe(sanitizedStr2)
    expect(cmp.vm.containsReservedChars(str2)).toBe(true)

    const str3 = '<abc>'
    const sanitizedStr3 = cmp.vm.sanitizeName(str3)
    expect(orig).toBe(sanitizedStr3)
    expect(cmp.vm.containsReservedChars(str3)).toBe(true)

    const str4 = 'a/b\\c'
    const sanitizedStr4 = cmp.vm.sanitizeName(str4)
    expect(orig).toBe(sanitizedStr4)
    expect(cmp.vm.containsReservedChars(str4)).toBe(true)

    const str5 = '*:'
    const sanitizedStr5 = cmp.vm.sanitizeName(str5)
    expect('').toBe(sanitizedStr5)
    expect(cmp.vm.containsReservedChars(str5)).toBe(true)

    const str6 = 'a,b,c'
    const santizedStr6 = cmp.vm.sanitizeName(str6)
    expect(santizedStr6).toBe(orig)
    expect(cmp.vm.containsReservedChars(str6)).toBe(true)
  })
})
