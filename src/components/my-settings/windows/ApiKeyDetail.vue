<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="API Key"
    />

    <dialog-body>
      <div class="api-key-message">
        For your protection, store your access keys securely and do not share them.
        You will not be able to access the key again once this window is closed.
      </div>
      <p><strong>Key:</strong> {{ apiKey.key }} </p>
      <p><strong>Secret:</strong> {{ apiKey.secret }}</p>

      <div class="copy-text">
        {{ copyText }}
      </div>
    </dialog-body>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="copyApiKey"
      >
        Copy API Key
      </bf-button>
      <bf-button
        class="secondary"
        @click="copyApiSecret"
      >
        Copy API Secret
      </bf-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'

export default {
  name: 'DeleteApiKey',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  data() {
    return {
      apiKey: {},
      copyText: '',
      dialogVisible: false,
      labelPosition: 'right'
    }
  },

  methods: {
    /**
     * Copy API key to clipboard
     */
    copyApiKey: function() {
      const key = this.apiKey.key
      this.$clipboard(key)
      this.copyText = 'API key copied to the clipboard.'
    },
    /**
     * Copy API secret to clipboard
     */
    copyApiSecret: function() {
      const secret = this.apiKey.secret
      this.$clipboard(secret)
      this.copyText = 'API secret copied to the clipboard.'
    },
    /**
     * Clear api key state
     */
    clearKey: function() {
      this.apiKey = {}
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      this.clearKey()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables';

.api-key-message {
  margin-bottom: 20px;
}

.copy-text {
  color: $nucleus;
  height: 24px;
}
</style>
