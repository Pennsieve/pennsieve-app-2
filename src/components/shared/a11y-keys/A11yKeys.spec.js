import { mount } from 'vue-test-utils'
import A11yKeys from './A11yKeys.vue'

describe('A11yKeys.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = mount(A11yKeys, {
      slots: {
        default: '<input id="name" />'
      },
      attachToDocument: true
    })
  })

  it('mounted: add event listener for keypress', () => {
    const spy = jest.spyOn(cmp.vm, 'handleKeyPress')
    cmp.trigger('keypress.enter')
    expect(spy).not.toBeCalled()
  })

  it('handleKeyPress: emits an event if key name is in the map', (done) => {
    cmp.vm.$on('key-pressed', data => {
      expect(data.keyCode).toBe(13)
      done()
    })
    cmp.setProps({
      keyName: 'enter'
    })
    cmp.vm.handleKeyPress({keyCode: 13})
  })

  it('handleKeyPress: emits a custom event if key name is in the map', (done) => {
    cmp.vm.$on('enter-pressed', data => {
      expect(data.keyCode).toBe(13)
      done()
    })
    cmp.setProps({
      keyName: 'enter',
      eventName: 'enter-pressed'
    })
    cmp.vm.handleKeyPress({keyCode: 13})
  })

  it('handleKeyPress: does not emit an event if key name is not in the map', () => {
    cmp.setProps({
      keyName: 'enter2'
    })
    const fn = cmp.vm.handleKeyPress({keyCode: 13})
    expect(fn).toEqual(undefined)
  })
})