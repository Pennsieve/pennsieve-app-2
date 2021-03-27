import EnumItem from './EnumItem.vue'
import { shallow } from 'vue-test-utils'

const evt = {
  preventDefault: () => {}
}

describe('EnumItem.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(EnumItem)
    cmp.setProps({
      item: 'Jawn #1'
    })
    cmp.update()
  })

  it('Computes item name', () => {
    expect(cmp.vm.item).toBe('Jawn #1')
  })

  it('deleteItem', (done) => {
    const spy = jest.spyOn(evt, 'preventDefault')
    cmp.vm.$on('remove-item-from-list', itemName => {
      expect(itemName).toBe('Jawn')
      expect(spy).toHaveBeenCalled()
      done()
    })
    cmp.vm.deleteItem(evt, 'Jawn')
  })
})