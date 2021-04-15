<template>
  <div>
    <el-dialog
      class="simple"
      :visible="visible"
      :append-to-body="true"
      :show-close="false"
      @close="closeDialog"
    >
      <bf-dialog-header slot="title" />
      <dialog-body>
        <svg-icon
          icon="icon-link"
          class="mb-8"
          height="32"
          width="32"
          color="#2760FF"
        />
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
            Link ORCID
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
import EventBus from '@/utils/event-bus'

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
      default: true
    }
  },

  computed: {
    ...mapState([
      'config',
      'userToken',
      'profile'
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
      'updateProfile',
      'updateOnboardingEvents'
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
              self.onOrcidAdded(response)
            })
            .catch(self.handleXhrError.bind(this))
        }
      })
    },

    /**
     * After ORCID has been added, update
     * the profile, set the onboarding event and
     * close the dialog
     */
    onOrcidAdded: function(orcid) {
      // Set onboarded event
      this.sendXhr(`${this.config.apiUrl}/onboarding/events?api_key=${this.userToken}`, {
        method: 'POST',
        body: 'AddedOrcid',
        header: {
          Authorization: `bearer ${this.userToken}`
        }
      })
        .then(() => {
          const onboardingEvents = [...this.onboardingEvents, 'AddedOrcid']
          this.updateOnboardingEvents(onboardingEvents)
        })
        .catch(this.handleXhrError.bind(this))

      // Update user profile
      this.updateProfile({
        ...this.profile,
        orcid
      })

      // Dismiss dialog
      this.closeDialog()

      // Display success toast
      EventBus.$emit('toast', {
        detail: {
          msg: 'Your ORCID has been successfully added'
        }
      })
    },

    /**
     * Close dialog by emitting sync event
     */
    closeDialog: function() {
      this.$emit('update:visible', false)
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
