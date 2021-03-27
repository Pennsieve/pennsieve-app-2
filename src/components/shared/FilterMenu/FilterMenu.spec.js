import { mount } from 'vue-test-utils'
import FilterMenu from './FilterMenu.vue'

const options = [
  {
    label: 'foo',
    value: 'FOO'
  },
  {
    label: 'bar',
    value: 'BAR'
  }
]

describe('FilterMenu.vue', () => {
  let cmp = {}

  beforeEach(() => {
    cmp = mount(FilterMenu, {
      propsData: {
        options,
        selectedOption: options[0]
      }
    })
  })

  it('Displays label properly', () => {
    const selectedLabel = cmp.find('[data-selected-label]')
    expect(selectedLabel.text()).toBe('Show foo')
  })

  it('Emits event when selected', async () => {

    const option = options[1]

    const secondOption = cmp.find(`[data-menu-item="option-${option.value}"]`)
    await secondOption.trigger('click')
    const emitted = cmp.emitted('select')

    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual([option])
  })
})
