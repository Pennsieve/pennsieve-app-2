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
import { mapGetters, mapState } from 'vuex'
import { pathOr, prop } from 'ramda'
import Auth from '@aws-amplify/auth'

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
    ]),

    ...mapState([
      'cognitoUser'
    ])
  },

  methods: {
    /**
     * Makes XHR call to update two factor auth status
     */
    sendDisableTwoFactorRequest: function() {
      this.closeDialog()
      Auth.setPreferredMFA(this.cognitoUser, 'NOMFA').then(resp => {
        this.handleTwoFactorXhrSuccess()
      })

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
