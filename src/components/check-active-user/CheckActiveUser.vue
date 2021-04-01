<template />

<script>
import { mapGetters } from 'vuex'
import Auth from '@aws-amplify/auth'

import EventBus from '@/utils/event-bus'

export default {
  name: 'CheckActiveUser',

  data() {
    return {
      // interval to poll user session 5 minutes
      interval: 10000,
      // async request reference
      pingUserHandle: null
    }
  },

  computed: {
    ...mapGetters([
      'userToken'
    ])
  },

  watch: {
    /**
     * Watch for when userToken is defined
     * @param {String} userToken
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
        Auth.currentSession()
          .then(() => {
            this.pingUserActive()
          })
          .catch(() => {
            this.callLogout()
            return clearTimeout(this.pingUserHandle)
          })
      }, this.interval)
    }
  }
}
</script>
