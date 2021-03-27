<template>
  <el-dialog
    :visible="visible"
    class="withdraw-dataset-dialog simple"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <h2>Withdraw Dataset?</h2>
      <p>
        Withdraw your dataset from the review process.
      </p>

      <p>This action cannot be undone.</p>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          @click="withdrawDataset"
        >
          Submit
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
  export default {
    name: 'WithdrawDatasetDialog',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton
    },

    props: {
      visible: {
        type: Boolean,
        default: false
      },
    },

    methods: {
      /**
       * Closes the dialog
      */
      closeDialog: function() {
        this.$emit('on-close')
      },

      /**
       * Emit event when clicking withdraw button
       */
      withdrawDataset: function() {
        this.$emit('on-withdraw')
      }
    },
  }
</script>

<style lang="scss" scoped>
.dialog-body {
  .dialog-simple-buttons {
    margin-top: 40px;
  }

  p {
    color: #000;
  }

  h2 {
    margin-bottom: 21px;
  }
}
</style>
