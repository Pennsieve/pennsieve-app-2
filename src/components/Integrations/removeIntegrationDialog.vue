<template>
  <el-dialog
    class="simple"
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="onClosed"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <svg-icon
        class="mb-16"
        name="icon-warning-circle"
        height="32"
        width="32"
      />
      <h2>Delete integration?</h2>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="close"
        >
          Cancel
        </bf-button>
        <bf-button
          class="red"
          :processing="isProcessing"
          @click="removeIntegration"
        >
          Delete
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
  name: 'RemoveIntegrationDialog',
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
  data: function () {
    return {
      isProcessing: false,
      deleteIntegration: {
        type: Object,
        default: () => {
          return {
          }
        }
      }
    }
  },
  computed: {

  },
  methods: {
    setIntegration: function(integration) {
      this.deleteIntegration = integration
    },
    removeIntegration: function() {
      this.$emit('delete', this.deleteIntegration)
    },
    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('update:visible', false)
    },
    /**
     * Callback after the dialog has closed
     * Reset dialog
     */
    onClosed: function() {
      this.isProcessing = false
    },

  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/_variables.scss';
.mb-16 {
  color: $red_1
}
h2 {
  color: #000;
  font-size: 14px;
  list-style: 16px;
  margin: 0 0 8px;
}
</style>