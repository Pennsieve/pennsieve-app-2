<template>
  <el-dialog
    :visible.sync="visible"
    class="bf-delete-dialog simple"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />

    <dialog-body>
      <svg-icon
        class="mb-8"
        name="icon-warning-circle"
        height="32"
        width="32"
        color="#2760ff"
      />
      <h2>New Status Name</h2>
      <p>Are you sure you want to rename this status? This change will impact all datasets it has been applied to.</p>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="primary"
          @click="renameStatus"
        >
          Continue
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
    name: 'RenameStatusDialog',

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

      id: {
        type: Number,
        default: 0
      }
    },

    methods: {
      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.$emit('close-dialog')
      },

      renameStatus: function() {
        this.$emit('rename-status', this.id)
        this.closeDialog()
      }
    }
  }
</script>

<style scoped lang="scss">
  @import '../../../assets/_variables.scss';

  .svg-icon {
    color: $app-primary-color;
  }
  .dialog-body {
    text-align: center
  }

  h2 {
    margin-bottom: 8px;
    font-size: 14px;
  }

  p {
    color: $gray_4;
    font-size: 14px;
    font-weight: normal;
    line-height: 18px;
  }
</style>
