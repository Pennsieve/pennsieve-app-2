<template>
  <el-dialog
    :show-close="false"
    :visible.sync="dialogVisible"
    class="simple"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <h2
        slot="heading"
        class="dialog-header"
      >
        An Invite has been sent!
      </h2>
      <p class="dialog-text">
        We've emailed account setup instructions to
      </p>
      <p class="dialog-text-strong">
        {{ email }}
      </p>
      <p class="dialog-text">
        Once active, this email will only have access to
        <a
          href="http://trials.blackfynn.com"
          target="_blank"
        >
          trials.blackfynn.com
        </a>
      </p>

      <div class="dialog-simple-buttons">
        <bf-button
          class="primary dialog-button"
          @click="closeDialog"
        >
          Got It
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
  import DialogBody from '../../shared/dialog-body/DialogBody.vue'
  import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
  import BfButton from '../../shared/bf-button/BfButton.vue'
  export default {
    name: 'InviteConfirmation',

    components: {
      DialogBody,
      BfButton,
      BfDialogHeader
    },

     props: {
      isVisible: {
        type: Boolean,
        default: false
      },
      email: {
        type: String,
        default: ''
      }
    },

    data() {
      return {
        dialogVisible: false
      }
    },

    watch: {
      /**
       * Watches isVisible to see if the dialog is visible
       */
      isVisible: {
        handler: function(val) {
          if (val !== undefined) {
            this.dialogVisible = val
          }
        },
        immediate: true
      }
    },

    methods: {
      /**
       * Closes the dialog
      */
      closeDialog: function() {
        this.$emit('close-confirmation-dialog')
      }
    },
  }
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';
  .dialog-header {
    line-height: 16px;
    width: 169px;
    color: #000;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    margin-top: -13px;
  }

  .dialog-text {
    text-align: center;
    width: 444px;
    color: #71747C;
    font-size: 14px;
    line-height: 16px;
  }

 .dialog-text-strong {
   text-align: center;
   font-weight: 600;
   margin-top: -1px;
   color: $gray_6;
   display: block;
 }

</style>