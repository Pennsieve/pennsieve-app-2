import { mapActions } from 'vuex'
import { defaultTo, prop } from 'ramda'

import EventBus from '../../utils/event-bus'
import Cookies from 'js-cookie'

export default {
  methods: {
    ...mapActions([
      'clearState'
    ]),
    /**
     * 'logout' event callback
     */
    handleLogout: function(payload) {
      const shouldShowToast = defaultTo(false, prop('shouldShowToast', payload))
      const shouldRedirect = defaultTo(false, prop('shouldRedirect', payload))

      // clear vuex
      this.clearState()
      // remove user token
      Cookies.remove('user_token')

      // Add a redirect link
      let query = {}
      if (shouldRedirect) {
        query = {
          redirectTo: this.$route.fullPath
        }
      }

      // route user to login page
      this.$router.replace({
        name: 'home',
        query
      })
      // fire toast
      if (shouldShowToast) {
        EventBus.$emit('toast', { detail: { msg: 'Logged Out' }})
      }
    }
  }
}
