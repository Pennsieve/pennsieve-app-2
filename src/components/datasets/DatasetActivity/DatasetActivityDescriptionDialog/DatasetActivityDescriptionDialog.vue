<template>
  <div>
    <a
      href="#"
      @click.prevent="visible = true"
    >
      Show details
    </a>
    <el-dialog
      :visible.sync="visible"
      :show-close="false"
      @close="visible = false"
    >
      <bf-dialog-header
        slot="title"
        title="Dataset description added"
      />

      <dialog-body>
        <div v-html="parsedMarkdown" />
      </dialog-body>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <bf-button
          class="secondary"
          @click="visible = false"
        >
          Close
        </bf-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import marked from 'marked'

import BfButton from '@/components/shared/bf-button/BfButton.vue'
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'

marked.setOptions({
  sanitize: true
})

export default {
  name: 'DatasetActivityDescriptionDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
  },

  props: {
    description: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      visible: false
    }
  },

  computed: {
    /**
     * Parse markdown description to be rendered
     * @returns {String}
     */
    parsedMarkdown: function() {
      return marked(this.description)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';
@import '../../../shared/MarkdownEditor/_markdown.scss';

/deep/ .el-dialog__body {
  max-height: 500px;
  overflow: scroll;
}
</style>
