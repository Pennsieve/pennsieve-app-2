import Vuex from 'vuex'
import { mount } from 'vue-test-utils'

import { actions, mutations, getters } from '../../vuex/store'
import BfFeedback from './BfFeedback.vue'
import EventBus from '../../utils/event-bus'
import flushPromises from 'flush-promises'

describe('BfFeedback.vue', () => {
  let cmp
  let store
  let state

  const Event = {
    preventDefault: jest.fn(() => {})
  }

  const feedback = {
    "id": 1,
    "name": "Cameron Baney",
    "email": "cameron@blackfynn.com",
    "about": "",
    "company": null,
    "job_role": null,
    "feedbacks": {
      "id": "215497",
      "feedback": "",
      "source": "api",
      "created_at": "2018-03-22 15:07:16",
      "updated_at": "2018-03-22 15:07:16",
      "tags": [],
      "ideas": [],
      "products": [],
      "personas": [],
      "attachments": [],
      "external_links": [
        {
          "id": 135397,
          "name": "Referral Page",
          "url": "",
          "added": "2018-03-22 15:07:16"
        }
      ]
    },
    "created_at": "2018-02-20 21:50:43",
    "updated_at": "2018-02-20 21:50:43"
  }


  beforeEach(() => {
    state = {
      config: {
        apiUrl: 'https://app.blackfynn.net'
      },
      profile: {
        id: 1,
        firstName: 'Clarke',
        lastName: 'Kent'
      },
      userToken: '123',
      activeOrganization: {
        isAdmin: true,
        organization: {
          name: 'Blackfynn',
          id: 777
        },
        administrators: [{id: 1}]
      }
    }
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    })
    fetch.mockResponse(JSON.stringify(feedback), {status: 200})
    cmp = mount(BfFeedback, {
      attachToDocument: true,
      store
    })
  })

  it('openFeedback()', () => {
    EventBus.$emit('open-feedback')
    expect(cmp.vm.dialogVisible).toBe(true)
  })

  it('Closing dialog resets component', () => {
    cmp.vm.$refs.feedbackForm.resetFields = jest.fn(() => {})
    cmp.vm.closeDialog()

    expect(cmp.vm.$refs.feedbackForm.resetFields).toBeCalled()
    expect(cmp.vm.success).toBe(false)
    expect(cmp.vm.dialogVisible).toBe(false)
  })

  it('Closing dialog resets component (no feedbackForm)', () => {
    delete cmp.vm.$refs.feedbackForm
    cmp.vm.closeDialog()
    expect(cmp.vm.success).toBe(false)
    expect(cmp.vm.dialogVisible).toBe(false)
  })

  it('handleKeyPress', () => {
    const spy = jest.spyOn(cmp.vm, 'submitFeedback')
    cmp.vm.$refs.feedbackForm.validate = () => {}
    cmp.vm.handleKeyPress(Event)
    expect(Event.preventDefault).toBeCalled()
    expect(spy).toBeCalled()
  })

  it('Opening', () => {
    cmp.vm.handleOpen()
    expect(cmp.vm.success).toBe(false)
  })

  it('submitFeedback: invalid state', () => {
    const spy = jest.spyOn(cmp.vm, 'sendRequest')
    cmp.vm.$refs.feedbackForm.validate = (cb) => {
      return cb(false)
    }
    cmp.vm.submitFeedback('feedbackForm')
    expect(spy).not.toBeCalled()
  })

  it('submitFeedback: valid state', () => {
    cmp.vm.feedbackForm.feedback = 'My feedback'
    const spy = jest.spyOn(cmp.vm, 'sendRequest')
    cmp.vm.$refs.feedbackForm.validate = (cb) => {
      return cb(true)
    }
    cmp.vm.submitFeedback('feedbackForm')
    expect(spy).toBeCalled()
  })

  it('submitFeedback(): success', (done) => {
    fetch.mockResponse(JSON.stringify(feedback), {status: 200})
    cmp.vm.sendRequest()
    flushPromises().then(() => {
      expect(cmp.vm.success).toBe(true)
      done()
    })
  })

  it('sendRequest(): failure', (done) => {
    fetch.mockRejectOnce(JSON.stringify({message: 'Error'}), {status: 500})
    EventBus.$on('ajaxError', () => {
      done()
    })
    cmp.vm.sendRequest()
  })

})
