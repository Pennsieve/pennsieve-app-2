<template>
  <el-dialog
    :visible="visible"
    class="revise-dataset-dialog simple"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <h2>Request Revision?</h2>
      <p>
        Request a revision from the Publishers within your organization to make changes to public metadata.
      </p>

      <p>This action cannot be undone.</p>

      <div class="dialog-simple-buttons">
        <bf-button
          @click="reviseDataset"
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
    name: 'RequestRevisionDialog',

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
       * Submits a request to revise a dataset that has been published
       */
      reviseDataset: function() {
        this.$emit('on-revision')
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
    margin-bottom: 15px;
  }

  h2 {
    margin-bottom: 21px;
  }
}
</style>
