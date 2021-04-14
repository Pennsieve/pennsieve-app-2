<template>
  <el-dialog
    class="simple"
    :visible.sync="dialogVisible"
    :show-close="false"
    @close="closeDialog"
  >
    <dialog-body>
      <h2 slot="heading">
        Disable Two-Factor Authentication
      </h2>
      <p>Are you sure you want to disable two factor authentication?</p>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="red"
          @click="sendDisableTwoFactorRequest"
        >
          Confirm
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { pathOr, prop } from 'ramda'

import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'

import Request from '../../../mixins/request'
import EventBus from '../../../utils/event-bus'

export default {
  name: 'DisableTwoFactor',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    Request
  ],

  data() {
    return {
      dialogVisible: false,
      labelPosition: 'right'
    }
  },

  computed: {
    ...mapGetters([
      'profile',
      'activeOrganization',
      'userToken',
      'config'
    ]),
    twoFactorUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)
      const userToken = prop('userToken', this)

      if (!url || !userToken) {
        return ''
      }
      return `${url}/user/twofactor?api_key=${userToken}`
    }
  },

  methods: {
    ...mapActions([
      'updateProfile'
    ]),
    /**
     * Makes XHR call to update two factor auth status
     */
    sendDisableTwoFactorRequest: function() {
      this.closeDialog()

      // this.sendXhr(this.twoFactorUrl, {
      //   method: 'DELETE',
      // })
      // .then(this.handleTwoFactorXhrSuccess.bind(this))
      // .catch(this.handleXhrError.bind(this))
      this.handleTwoFactorXhrSuccess()
    },
    /**
     * Handles successful two factor xhr response
     * @param {Object} response
     */
    handleTwoFactorXhrSuccess: function(response) {
      EventBus.$emit('toast', {
        detail: {
          type: 'MESSAGE',
          msg: 'Two-factor Authentication successfully deleted'
        }
      })

      this.updateProfile({
        ...this.profile,
        authyId: false
      })
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
    }
  }
}
</script>
