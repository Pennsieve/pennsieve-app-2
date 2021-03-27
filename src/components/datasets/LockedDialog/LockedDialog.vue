<template>
  <div>
    <el-dialog
      class="locked-dialog"
      :visible="visible"
      :append-to-body="true"
      @close="toggleVisible"
    >
      <dialog-body>
        <svg-icon
          class="mb-8"
          name="icon-lock"
          height="32"
          width="32"
          color="#2760FF"
        />
        <h2>This dataset is under review</h2>
        <p>
          This dataset is currently awaiting review by Publishers within your organization.
          We’ve locked this dataset temporarily to follow protocol
          and will send you an email once the dataset status has changed.
        </p>
        <div class="dialog-simple-buttons">
          <bf-button @click.prevent="toggleVisible">
            Got It
          </bf-button>
        </div>
      </dialog-body>
    </el-dialog>
  </div>
</template>

<script>
  import BfButton from '../../shared/bf-button/BfButton.vue';
  import DialogBody from '../../shared/dialog-body/DialogBody.vue';
  export default {
    name: 'LockedDialog',
    components: {
      BfButton,
      DialogBody
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
    },
    methods: {
      /**
     * Toggles modal to be visible or not
     */
    toggleVisible: function() {
      this.$emit('toggle-visible', false)
    },
    },
  }
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';
 .locked-dialog {
    /deep/ .el-dialog__header {
      border-bottom: none;
    }
    text-align: center;
    p {
      font-weight: normal;
      color: $dark-gray;
      padding: 8px 0;
    }
  }
</style>