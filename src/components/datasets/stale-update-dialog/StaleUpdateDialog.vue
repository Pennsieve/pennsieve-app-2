<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Dataset Change Detected"
    />
    <dialog-body class="confirm-stale-update-body">
      <p>
        A contributor has made changes to this page.  Before your changes can be saved, you must reload the page.
      </p>
      <div>
        <p>
          <strong>
            Please note, changes you made will not be saved.
          </strong>
        </p>
      </div>
    </dialog-body>
    <div slot="footer">
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        class="primary"
        @click="onConfirmClick"
      >
        Reload Page
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
  import BfDialogHeader from "@/components/shared/bf-dialog-header/BfDialogHeader"
  import BfButton from "@/components/shared/bf-button/BfButton"
  import DialogBody from "@/components/shared/dialog-body/DialogBody"

  export default {

    components: {
      BfDialogHeader,
      BfButton,
      DialogBody
    },

    data() {
      return {
        dialogVisible: false,
      }
    },

    methods: {
      /**
       * close the dialog
       */
      closeDialog: function() {
        this.dialogVisible = false
      },
      /**
       * closes the dialog and sends calls the provided sendRequest function
       */
      onConfirmClick: function() {
        const currentHref = window.location.href
        window.location.replace(currentHref)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/_variables';
  .confirm-stale-update-body {
    /deep/ p {
      color: $app-secondary-color
    }
  }
</style>