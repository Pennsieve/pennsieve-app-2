import { mapActions, mapState } from 'vuex'

import Request from '@/mixins/request'

export default {
  mixins: [
    Request
  ],

  computed: {
    ...mapState([
      'config',
      'userToken'
    ]),

    /**
     * Retrieves the API URL for adding ORCID
     */
     getORCIDApiUrl: function() {
      return `${this.config.apiUrl}/user/orcid?api_key=${this.userToken}`
    }
  },

  methods: {
    ...mapActions([
      'updateProfile'
    ]),

    openORCID: function() {
      const orcidWindow = window.open(this.config.ORCIDUrl, "_blank", "toolbar=no, scrollbars=yes, width=500, height=600, top=500, left=500");

      const self = this
      window.addEventListener('message', function(event) {
        const oauthCode = event.data
        if (event.source === orcidWindow) {
          if (!self.getORCIDApiUrl) {
            return
          }

          self.sendXhr(self.getORCIDApiUrl, {
            method: 'POST',
            body: {
              "authorizationCode": oauthCode
            }
          })
            .then((response) => {
              self.updateProfile({
                ...self.profile,
                orcid: response
              })

              self.$emit('orcid-added')
            })
            .catch(self.handleXhrError.bind(this))
        }
      })
    }
  }
}
