<template>
  <login v-loading="isLoadingJupyterCredentials" />
</template>

<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
import { propOr, pathOr } from 'ramda'
import Login from '@/routes/login/Login'
import { Auth } from '@aws-amplify/auth'


import Request from '@/mixins/request'

export default {
  name: 'JupyterLogin',

  components: {
    Login
  },

  mixins: [
    Request
  ],

  data() {
    return {
      isLoadingJupyterCredentials: false
    }
  },

  computed: {
    ...mapState([
      'config',
      'userToken'
    ])
  },

  watch: {
    /**
     * Watch token in state, and get docs login
     * when it is populated. This will happen
     * when a user uses the form to log in
     * @params {String} token
     */
    userToken: function(token) {
      const state = pathOr('', ['query', 'state'], this.$route)
      if (token) {
        this.getJupyterHubLogin(token,state)
      }
    }
  },

  /**
   * Get token from Cookie, this will work
   * for a when a user is already signed in to
   * the app
   */
  mounted: function() {
    const state = pathOr('', ['query', 'state'], this.$route)
    const token = Cookies.get('user_token')

    if(token) {
      this.getJupyterHubLogin(token, state)
    }
  },

  methods: {
    /**
     * Request Readme Credentials and then
     * redirect to Pennsieve Docs on success
     * @params {String} token
     */
    getJupyterHubLogin: function(token,state) {
      this.isLoadingJupyterCredentials = true
      window.location.replace(`${this.config.jupyterHubUrl}/hub/oauth_callback?code=${token}&state=${state}`)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
