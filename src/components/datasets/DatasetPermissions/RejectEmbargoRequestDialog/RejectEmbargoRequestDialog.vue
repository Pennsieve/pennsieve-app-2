<template>
  <el-dialog
    class="bf-delete-dialog simple"
    :visible="visible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />

    <dialog-body>
      <h2>Reject Request?</h2>
      <p>Continuing will remove this request to access your dataset.</p>
      <p>This action cannot be undone, but the user may re-request access.</p>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="primary"
          @click="rejectRequest"
        >
          Submit
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
  export default {
    name: 'RejectEmbargoRequestDialog',
    components: {
      BfButton,
      BfDialogHeader,
      DialogBody
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      rejectedRequest: {
        type: Object,
        default: () => {}
      }
    },
    methods: {
      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.$emit('close-dialog')
      },

      /**
       * Emits reject request event
       */
      rejectRequest: function() {
        this.$emit('submit', this.rejectedRequest)
        this.closeDialog()
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
  .dialog-body {
    text-align: center;
    .simple & {
      padding: 40px 48px !important;
    }
    .dialog-simple-buttons {
      margin-top: 40px;
    }
  }

  h2 {
    font-size: 16px;
    font-weight: 700;
    line-height: 19px;
  }

  p {
    color: #000;
    font-size: 14px;
    font-weight: normal;
    line-height: 16px;
  }


</style>
