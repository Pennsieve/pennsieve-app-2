<template>
  <login v-loading="isLoadingReadmeCredentials" />
</template>

<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'

import Login from '@/routes/login/Login'

import Request from '@/mixins/request'

export default {
  name: 'DocsLogin',

  components: {
    Login
  },

  mixins: [
    Request
  ],

  data() {
    return {
      isLoadingReadmeCredentials: false
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
      if (token) {
        this.getDocsLogin(token)
      }
    }
  },

  /**
   * Get token from Cookie, this will work
   * for a when a user is already signed in to
   * the app
   */
  mounted: function() {
    const token = Cookies.get('user_token')
    if (token) {
      this.getDocsLogin(token)
    }
  },

  methods: {
    /**
     * Request Readme Credentials and then
     * redirect to Pennsieve Docs on success
     * @params {String} token
     */
    getDocsLogin: function(token) {
      this.isLoadingReadmeCredentials = true

      this.sendXhr(`${this.config.apiUrl}/session/readme-credentials?api_key=${token}`, { method: 'GET' })
        .then(response => window.location.replace(`${this.config.docsUrl}?auth_token=${response}`))
        .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
