<template />

<script>
import Vue from 'vue'

import Request from '../../mixins/request/index'
import EventBus from '../../utils/event-bus'
import { mapGetters } from 'vuex'


export default Vue.component('check-active-user', {
  mixins: [
    Request
  ],

  data() {
    return {
      // interval to poll user session 5 minutes
      interval: 3e5,
      // async request reference
      pingUserHandle: null
    }
  },

  computed: {
    ...mapGetters([
      'userToken',
      'config'
    ]),

    /**
     * Compute active user url
     * @returns {String}
     */
    computeCheckActiveUserUrl: function() {
      if (this.config.apiUrl && this.userToken) {
        return `${this.config.apiUrl}/security/ping?api_key=${this.userToken}`
      }
    }
  },

  watch: {
    /**
     * Watch for when userToken is defined
     */
    userToken: function(userToken) {
      if (userToken !== '') {
        this.pingUserActive()
      }
    }
  },

  methods: {
    /**
     * Calls blackfynnApp._logout()
     */
    callLogout: function() {
      EventBus.$emit('logout', {
        shouldShowToast: true,
        shouldRedirect: true
      })
    },

    /**
     * sets pingUserHandle reference
     */
    pingUserActive: function() {
      // Send the ajax call to check if user is active every 5 minutes
      this.pingUserHandle = setTimeout(() => {
        this.sendXhr(this.computeCheckActiveUserUrl)
        .then(this.handleActiveUser.bind(this))
        .catch(this.handleActiveUser.bind(this))
      }, this.interval)
    },

    /**
     * Handles user session
     * @param {Object} response
     */
    handleActiveUser: function(response) {
      if (response.status >= 401) {
        this.callLogout()
        return clearTimeout(this.pingUserHandle)
      }
      this.pingUserActive()
    }
  }
})
</script>
