<template>
  <div>
    <el-dialog
      class="simple"
      :visible="visible"
      :append-to-body="true"
      :show-close="false"
    >
      <bf-dialog-header slot="title" />
      <dialog-body>
        <img
          src="/static/images/orcid.png"
          alt="Logo of ORCID"
          class="mb-8"
        >
        <h2>Link your ORCID</h2>
        <p>
          Connect your Pennsieve Profile to your ORCID. <a href="http://help.blackfynn.com/blackfynn-web-application/blackfynn-discover/linking-orcid-to-blackfynn">
            Learn More
          </a>
        </p>
        <div class="dialog-simple-buttons">
          <bf-button
            class="primary"
            @click="openORCID"
          >
            Relink ORCID
          </bf-button>
        </div>
      </dialog-body>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import BfButton from '@/components/shared/bf-button/BfButton.vue'
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'

import Request from '@/mixins/request'

export default {
  name: 'LinkOrcidDialog',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    Request
  ],

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

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
</script>

<style lang="scss" scoped>
img {
  height: 32px;
  width: 32px;
}
</style>
