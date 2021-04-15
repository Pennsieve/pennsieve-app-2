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
      this.pingUserHandle = setTimeout(async () => {
        try {
          const cognitoUser = await Auth.currentAuthenticatedUser()
          const currentSession = cognitoUser.signInUserSession
          cognitoUser.refreshSession(currentSession.refreshToken, (err, session) => {
            const token = session.accessToken.jwtToken
            Cookies.set('user_token', token)
            this.updateUserToken(token)
          })
        } catch (err) {
          this.callLogout()
          return clearTimeout(this.pingUserHandle)
        }
      }, this.interval)
    }
  }
}
</script>
