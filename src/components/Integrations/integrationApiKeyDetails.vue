<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="API Access for Integration"
    />

    <dialog-body>
      <div class="api-key-message">
        <p>This API key is associated with the created integration.
          It provides access to datasets that have the integration enabled. Store this access key and secret securely and do not share them.
          You will <b>not be able</b> to access the key again once this window is closed.</p>
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

import BfDialogHeader from '../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../shared/dialog-body/DialogBody.vue'
import BfButton from '../shared/bf-button/BfButton.vue'

export default {
  name: 'IntegrationApiKeyDetails',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  props: {
    visible: Boolean,
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
      this.clearKey()
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/_variables';

.api-key-message {
  margin-bottom: 20px;
}

.copy-text {
  color: $green_1;
  height: 24px;
}
</style>
