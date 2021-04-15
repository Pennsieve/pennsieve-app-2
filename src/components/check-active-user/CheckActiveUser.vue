<template />

<script>
import { mapActions, mapGetters } from 'vuex'
import Auth from '@aws-amplify/auth'
import Cookies from 'js-cookie'

import EventBus from '@/utils/event-bus'

export default {
  name: 'CheckActiveUser',

  data() {
    return {
      // interval to poll user session 4 minutes
      interval: 240000,
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
    ...mapActions([
      'updateUserToken'
    ]),

    /**
     * Calls PennsieveApp._logout()
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
          .then((data) => {
            const token = data.accessToken.jwtToken
            Cookies.set('user_token', token)
            this.updateUserToken(token).then(() => this.pingUserActive())
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
