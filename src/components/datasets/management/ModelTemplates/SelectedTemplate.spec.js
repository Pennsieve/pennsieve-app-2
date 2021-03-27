import Vue from 'vue'
import SelectedTemplate from './SelectedTemplate.vue'
import { mount } from 'vue-test-utils'

const evt = {
  preventDefault: () => {}
}

describe('SelectedTemplate.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = mount(SelectedTemplate, {
      attachToDocument: true,
    })
  })

  it('isTruncatedClasses: true', () => {
    cmp.vm.truncated = true
    expect(cmp.vm.isTruncatedClasses.indexOf('truncated') > 0).toBeTruthy()
  })

  it('isTruncatedClasses: false', () => {
    cmp.vm.truncated = false
    expect(cmp.vm.isTruncatedClasses.indexOf('truncated') < 0).toBeTruthy()
  })

  it('Emits uncheck-selected-template', (done) => {
    cmp.vm.$on('uncheck-selected-template', () => {
      done()
    })
    cmp.vm.toggleSelectedTemplate(evt)
  })

  it('Emits check-selected-template', (done) => {
    cmp.vm.$on('check-selected-template', () => {
      done()
    })
    cmp.setProps({
      checked: false
    })
    cmp.vm.toggleSelectedTemplate(evt)
  })

  it('Short circuits toggleSelectedTemplate', () => {
    const newEvt = Object.assign({}, {target: {tagName: 'a'}}, evt)
    const evtName = cmp.vm.toggleSelectedTemplate(newEvt)
    expect(evtName).toBe(undefined)
  })

  it('toggles truncated data property to true', () => {
    cmp.setData({
      truncated: false
    })
    cmp.vm.toggleText(evt)
    expect(cmp.vm.truncated).toBe(true)
  })

  it('toggles truncated data property to false', () => {
    cmp.setData({
      truncated: true
    })
    cmp.vm.toggleText(evt)
    expect(cmp.vm.truncated).toBe(false)
  })
})