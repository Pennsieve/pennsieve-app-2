<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
  >
    <bf-dialog-header
      slot="title"
      :title="dataUseAgreement.name"
    />

    <div class="bf-dialog-body">
      <div class="agreement-wrap">
        <!-- eslint-disable vue/no-v-html -->
        <!-- $sanitize will sanitize the HTML injected -->
        <div
          class="col-xs-12 col-md-8 description-container"
          v-html="parsedMarkdown"
        />
      </div>
    </div>

  </el-dialog>
</template>

<script>
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import marked from 'marked'

marked.setOptions({
    sanitize: true
})

export default {
  name: 'DataUseAgreementUpdateDialog',

  components: {
    BfDialogHeader,
    DialogBody
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dataUseAgreement: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      marked
    }
  },

  computed: {
    /**
     * Parses the markdown text
     */
    parsedMarkdown() {
      return marked(this.dataUseAgreementBody)
    },

    dataUseAgreementBody() {
      return this.replaceAllSlashEscapedSequences(this.dataUseAgreement.body)
    },
  },

  methods: {
    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('update:visible', false)
    },

    replaceAllSlashEscapedSequences(sourceString){
      var result = ''
      var remaining = sourceString
      var cutPoint = 0
      var index = remaining.indexOf("\\")
      while (index >= 0){
        var nextChar = remaining[index+1]
        var append = ''
        if (nextChar === 'n') {
          append = '\n'
        } else if (nextChar === 't') {
          append = '\t'
        }
        var slice = remaining.slice(cutPoint,index)
        result = result.concat(slice)
        result = result.concat(append)
        remaining = remaining.slice(index+2)
        index = remaining.indexOf("\\")
      }
      if (remaining.length > 0) {
        result = result.concat(remaining)
      }
      return result
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
.button-wrap {
  display: flex;
}
// Markdown styles
.description-container {
  color: #000;
  font-size: 16px;
  line-height: 24px;
  padding-top: 32px;
  white-space: pre-wrap;
  ::v-deep {
    h1,
    p,
    h2,
    h3,
    blockquote,
    h4,
    pre {
      max-width: 616px;
    }
    h1,
    h2,
    h3,
    h4,
    h5 {
      margin: 0 0 8px;
    }
    h1 {
      font-size: 32px;
      font-weight: bold;
      line-height: 40px;
    }
    p {
      margin-bottom: 16px;
    }
    img {
      height: auto;
      max-width: 170%;
      margin-bottom: 20px;
      flex-basis: 50%;
      margin-top: 24px;
    }
    h2 {
      font-size: 24px;
      font-weight: bold;
      line-height: 32px;
    }
    h3 {
      font-size: 20px;
      font-weight: bold;
      line-height: 24px;
      letter-spacing: 0px;
    }
    h4 {
      font-size: 16px;
      font-weight: bold;
      line-height: 24px;
      text-transform: uppercase;
      letter-spacing: 0px;
    }
    ul {
      margin: 0 0 16px;
      padding: 0 0 0 18px;
    }
    blockquote {
      font-weight: normal;
      line-height: 24px;
      font-size: 16px;
      border-left: 8px solid gray;
      margin-left: 0;
      p {
        margin-left: 16px;
      }
    }
    pre {
      background-color: #f1f1f3;
      line-height: 24px;
      padding: 16px;
      code {
        font-weight: normal;
        font-size: 14px;
      }
    }
  }
}
</style>
