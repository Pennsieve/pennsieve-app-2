<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="resetDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Describe the Reason for Rejection"
    />

    <dialog-body>
      <p>
        Please provide a reason for rejection of the publishing request. This will be included in the email that will be send to all collaborators on the dataset.
      </p>

      <div class="input-area">
        <el-input
          type="textarea"
          :rows="8"
          v-model="rejectRationale"
          maxlength="1024"
          show-word-limit
        />
      </div>

    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="close"
      >
        Cancel
      </bf-button>
      <bf-button
        processing-text="Submitting"
        :processing="isSubmitting"
        @click="rejectRequest"
      >
        Reject
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import moment from 'moment'

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'

import Request from '@/mixins/request/index'
import { PublicationStatus } from '@/utils/constants'
import EventBus from '@/utils/event-bus'


export default {
  name: 'RejectRequestDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data: function() {
    return {
      isSubmitting: false,
      rejectRationale: ""
    }
  },

  watch: {
    /**
     * Watches visible value
     * @param {Boolean} visible
     */
    visible: function(visible) {
      if (visible) {
        this.rejectRationale = ''
      }
    },

    // /**
    //  * Watches request_id query param
    //  * @param {String} val
    //  */
    // '$route.query.request_id': {
    //   handler: function(val) {
    //     if (val) {
    //       this.$emit('update:visible', true)
    //     }
    //   },
    //   immediate: true
    // }
  },

  methods: {
    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('update:visible', false)
    },
    resetDialog: function() {
      this.rejectRationale=""
    },

    /**
     * Reset values of the dialog
     */
    rejectRequest: function() {
      this.$emit('rejectRequest', this.rejectRationale)
    }
  }
}
</script>

<style scoped>
.el-select,
.el-date-editor {
  width: 100%;
}
.help-link {
  display: inline-flex;
}
.long-label {
  margin-right: 0;
}

.input-area {
  margin-top:24px
}
</style>
