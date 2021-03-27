import Vue from 'vue'
import BfCard from './BfCard.vue'
import { shallow } from 'vue-test-utils'

const evt = {
  preventDefault: () => {}
}

describe('BfCard.vue', () => {
  let cmp
  let cmpEmpty

  beforeEach(() => {
    cmp = shallow(BfCard, {
      attachToDocument: true,
      slots: {
        icon: '<div class="icon" />',
        footer: '<div class="footer" />'
      }
    })
    cmpEmpty = shallow(BfCard)
  })

  it('Has slots', () => {
    expect(cmp.vm.$slots.icon.length).toBe(1)
    expect(cmp.vm.$slots.footer.length).toBe(1)
  })

  it('Does not have slots', () => {
    expect(cmpEmpty.vm.$slots.icon).toBe(undefined)
    expect(cmpEmpty.vm.$slots.footer).toBe(undefined)
  })

  it('Truncates card copy property if length exceeds max', () => {
    const copy = 'Spicy jalapeno bacon ipsum dolor amet duis fatback pork loin mollit minim ham chicken leberkas meatloaf kevin pork chop. Sint officia cow, burgdoggen hamburger ea meatloaf duis in labore t-bone landjaeger frankfurter aliqua do.'
    cmp.setProps({ cardCopy: copy })
    cmp.update()
    expect(cmp.vm.formattedCopy.length).not.toBe(copy.length)
  })

  it('Does not truncate card copy property if length is less than max', () => {
    const copy = 'Bacon ipsum dolor amet spare ribs'
    cmp.setProps({ cardCopy: copy })
    cmp.update()
    expect(cmp.vm.formattedCopy.length).toBe(copy.length)
  })

  it('Does not emit the card-selected event if is-selectable is false', () => {
    expect(cmp.vm.checked).toBe(false)
    cmp.vm.sendEvent(evt)
  })

  it('Emits the card-checked event if is-selectable is true', (done) => {
    cmp.setProps({
      isSelectable: true
    })
    cmp.update()
    cmp.vm.$on('card-checked', () => {
      done()
    })
    cmp.vm.sendEvent(evt)
  })

  it('Does not emit the card-checked event if is-disabled is true', () => {
    cmp.setProps({
      isDisabled: true
    })
    cmp.update()
    const spy = jest.spyOn(evt, 'preventDefault')
    cmp.vm.sendEvent(evt)
    expect(spy).not.toHaveBeenCalled()
  })

  it('Emits the card-unchecked event if is-selectable is true and item is checked', (done) => {
    cmp.setProps({
      isSelectable: true,
      checked: true
    })
    cmp.update()
    const spy = jest.spyOn(evt, 'preventDefault')
    cmp.vm.$on('card-unchecked', () => {
      expect(spy).toHaveBeenCalled()
      done()
    })

    cmp.vm.sendEvent(evt)
  })

  it('Creates css classNames if isModelCard and checked are true', () => {
    cmp.setProps({
      isModelCard: true,
      checked: true
    })
    cmp.update()
    expect(cmp.vm.classNames).toBe('bf-card model-card active')
  })

  it('Creates css classNames if isModelCard is true and checked is false', () => {
    cmp.setProps({
      isModelCard: true,
      checked: false
    })
    cmp.update()
    expect(cmp.vm.classNames).toBe('bf-card model-card')
  })

  it('Creates css classNames if isModelCard is false and checked is true', () => {
    cmp.setProps({
      isModelCard: false,
      checked: true
    })
    cmp.update()
    expect(cmp.vm.classNames).toBe('bf-card active')
  })

  it('Creates css classNames if isModelCard is false and checked are false', () => {
    cmp.setProps({
      isModelCard: false,
      checked: false
    })
    cmp.update()
    expect(cmp.vm.classNames).toBe('bf-card')
  })
})
