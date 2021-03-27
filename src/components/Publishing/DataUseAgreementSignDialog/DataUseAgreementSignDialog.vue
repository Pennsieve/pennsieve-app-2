<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="resetDialog"
  >
    <bf-dialog-header
      slot="title"
      :title="dialogTitle"
    />

    <dialog-body>
      <div class="agreement-wrap">
        {{ dataUseAgreement.body }}
      </div>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-checkbox
        v-if="isSigningAgreement"
        v-model="isAgreementChecked"
        class="mb-16"
      >
        I agree to the terms and conditions of this data use agreement.
      </el-checkbox>
      <div class="button-wrap">
        <bf-button
          class="secondary"
          @click="close"
        >
          Cancel
        </bf-button>
        <bf-button
          v-if="isSigningAgreement"
          processing-text="Submitting"
          :disabled="!isAgreementChecked"
          :processing="isProcessing"
          @click="submit"
        >
          Submit and Sign
        </bf-button>
        <bf-button
          v-if="!isSigningAgreement"
          processing-text="Downloading"
          :processing="isProcessing"
          @click="download"
        >
          Download
        </bf-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import BfButton from '@/components/shared/bf-button/BfButton'
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'

export default {
  name: 'DataUseAgreementSignDialog',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody,
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dataUseAgreement: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isSigningAgreement: {
      type: Boolean,
      default: false
    },
  },

  data() {
    return {
      isAgreementChecked: false,
      isProcessing: false
    }
  },

  computed: {
    /**
     * Compute dialog title based on if the user is signing
     * @returns {String}
     */
    dialogTitle: function() {
      return this.isSigningAgreement
        ? 'Sign Data Use Agreement'
        : this.dataUseAgreement.name
    }
  },

  methods: {
    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('update:visible', false)
      this.$emit('update:isSigningAgreement', false)
    },

    /**
     * Reset the dialog
     */
    resetDialog: function() {
      this.isProcessing = false
      this.isAgreementChecked = false
    },

    /**
     * Submit and request access
     */
    submit: function() {
      this.isProcessing = true
      this.$emit('submit', this.dataUseAgreement.id)
    },

    /**
     * Download agreement
     */
    download: function() {
      this.isProcessing = true
      this.$emit('download', this.dataUseAgreement.id)
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}
.dialog-footer {
  flex-direction: column;
}
/deep/ .el-dialog__body {
  flex: 1;
  overflow: scroll;
}
.button-wrap {
  display: flex;
}
</style>
