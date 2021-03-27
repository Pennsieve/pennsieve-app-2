import { mount } from 'vue-test-utils'

import DataUseAgreementListItem from './DataUseAgreementListItem.vue'
import { defaultAgreement, agreement } from '../mock-data-use-agreements'

describe('DataUseAgreementListItem.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = mount(DataUseAgreementListItem, {
      propsData: {
        dataUseAgreement: { ...agreement }
      }
    })
  })

  it('Shows menu if not default agreement', () => {
    const menu = cmp.find('.el-dropdown')
    expect(menu.exists()).toBe(false)
  })

  it('Does not show menu, does show dot if default agreement', async () => {
    await cmp.setProps({
      dataUseAgreement: defaultAgreement
    })

    const menu = await cmp.find('.el-dropdown')
    expect(menu.exists()).toBe(false)

    const dot = await cmp.find('.default-dot')
    expect(dot.exists()).toBe(true)
  })
})
