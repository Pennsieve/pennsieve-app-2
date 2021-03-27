import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import { actions, mutations, getters } from '../../../vuex/store'
import OrgSettingsDataUseAgreements from './OrgSettingsDataUseAgreements.vue'

import { agreement, agreements } from './mock-data-use-agreements'

describe('OrgSettingsDataUseAgreements.vue', () => {
  let cmp
  let store
  let state

  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      userToken: '123',
      activeOrganization: {
        organization: {
          name: 'Blackfynn',
          id: 666
        }
      },
      dataUseAgreements: agreements
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    cmp = mount(OrgSettingsDataUseAgreements, {
      attachToDocument: false,
      store
    })

    cmp.vm.sendXhr = jest.fn(() => Promise.resolve({ data: {} }));
  })

  it('Should remove agreement from list when deleted', async () => {
    await cmp.vm.deleteDataUseAgreement(agreement)
    expect(cmp.vm.dataUseAgreements.length).toBe(2)
  })

  it('Should add agreement to list', async () => {
    await cmp.vm.addDataUseAgreement(agreement)
    expect(cmp.vm.dataUseAgreements.length).toBe(4)
  })

  it('Should update agreement in list', async () => {
    const updatedAgreement = {
      ...agreement,
      name: 'New updated name'
    }
    await cmp.vm.editDataUseAgreement(updatedAgreement)
    expect(cmp.vm.dataUseAgreements[1]).toMatchObject(updatedAgreement)
  })

  it('Should make agreement default, and update old default agreement', async () => {
    await cmp.vm.makeDataUseAgreementDefault(agreement)

    const defaultAgreements = cmp.vm.dataUseAgreements.filter(agreement => agreement.isDefault)
    expect(defaultAgreements.length).toBe(1)
  })
})
