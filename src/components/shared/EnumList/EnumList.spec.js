import EnumList from './EnumList.vue'
import { shallow } from 'vue-test-utils'
import { V4MAPPED } from 'dns';

const evt = {
  preventDefault: () => {}
}

describe('EnumList.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(EnumList)
  })

  it('addItem', () => {
    expect(cmp.vm.itemList.length).toBe(0)

    cmp.vm.newItem = 'Test'
    expect(cmp.vm.newItem.length).toBeGreaterThan(0)

    cmp.vm.addItem(evt)
    expect(cmp.vm.itemList.length).toBe(1)
    expect(cmp.vm.newItem.length).toBe(0)
  })

  it('onRemoveItemFromList', () => {
    cmp.setProps({
      savedList: ['A', 'B', 'C']
    })
    cmp.update()
    expect(cmp.vm.itemList.length).toBe(3)

    cmp.vm.onRemoveItemFromList('B')
    expect(cmp.vm.itemList.length).toBe(2)
  })
})