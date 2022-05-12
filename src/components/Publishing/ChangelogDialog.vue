<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
  >
    <bf-dialog-header
      slot="title"
      :title="Changelog"
    />

    <dialog-body>
      {{ changelogComponent.body }}
    </dialog-body>
  </el-dialog>
</template>

<script>
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'

export default {
  name: 'ChangelogDialog',

  components: {
    BfDialogHeader,
    DialogBody
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    chnagelogComponent: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  methods: {
    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('update:visible', false)
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
/deep/ .el-dialog__body {
  flex: 1;
  overflow: scroll;
}
</style>
