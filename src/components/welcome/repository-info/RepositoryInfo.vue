<template>
  <el-dialog
    :visible="visible"
    :custom-class="calculateModalWidth"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Repository Information"
    />

    <dialog-body>
      <markdown-editor
        ref="markdownEditor"
        :value="repositoryDescription"
        :is-editing="false"
        :is-saving="false"
        :is-loading="isLoadingRepositoryDescription"/>
    </dialog-body>

  </el-dialog>

</template>

<script>
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import MarkdownEditor from '@/components/shared/MarkdownEditor/MarkdownEditor.vue'

import {
  mapState,
  mapActions
} from 'vuex'
export default {
  name: "RepositoryInfo",
  components: {
    BfDialogHeader,
    DialogBody,
    MarkdownEditor,
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState([
      'primaryNavCondensed',
      'secondaryNavOpen',
    ]),
    ...mapState('repositoryModule',[
      "repositoryDescription",
      "isLoadingRepositoryDescription"
    ]),

    /**
     * Calculate modal width based on navigation width
     * @returns {String}
     */
    calculateModalWidth: function() {
      return this.primaryNavCondensed || this.secondaryNavOpen
        ? 'condensed-nav-modal-width'
        : 'default-nav-modal-width'
    },
  },
  methods: {
    ...mapActions('repositoryModule',[
        'updateModalVisible'
      ]
    ),
    /**
     * Closes the Search Across All Datasets dialog
     */
    closeDialog: function() {
      this.updateModalVisible(false)
    },
  }
}
</script>

<style lang="scss">
.el-dialog {
  margin-top: 16px !important;
}

.default-nav-modal-width {
  width: calc(100vw - 32px - 230px);
  margin-left: 246px;
  overflow-y: auto;
}

.condensed-nav-modal-width {
  width: calc(100vw - 32px - 56px);
  margin-left: 72px;
  overflow-y: auto;
}
</style>

<style scoped>

</style>