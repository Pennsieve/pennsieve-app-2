<template>
  <el-dialog
    :visible="visible"
    :show-close="true"
    width="35%"
    class="login-class-dialog"
    @close="closeDialog"
  >
    <div class="login-class-container">
      <button class="close-dialog" @click="closeDialog">
      </button>
      <div class="aws-container">

        <h1>Create Changelog for Dataset Updates</h1>

        <p class="centered-spaced">
          Please provide a detailed list of changes made to the dataset since it's last publication. <br>Please include ...
        </p>
        <p class="markdown-box">
        <!-- insert mardown editor component here -->
        <markdown-editor
          ref="markdownEditor"
          <!--CHANGE :value="datasetDescription" -->
          :is-editing="isEditingMarkdown"
          :is-saving="isSavingMarkdown"
          :empty-state="datasetDescriptionEmptyState"
          :is-loading="isLoadingDatasetDescription"
          @save="onReadmeSave"
        />
        </p>
          <p class="centered-spaced">
          <button class="login-orcid-button" @click="onLoginWithORCID">
            Save Changelog <br>
          </button>
        </p>
        <!--
        <p v-if="showOrcidError"
        class="orcid-error-text">
        That ORCiD ID is not associated with a Pennsieve account (UPDATE ERROR MSG ACCORDINGLY)...
        </p>
        -->
          </div>
    </div>
  </el-dialog>
</template>

<script>

import Request from '../../mixins/request'
import { mapActions } from 'vuex'
import MarkdownEditor from '../../shared/MarkdownEditor/MarkdownEditor.vue'

export default {
  name: 'LoginPopup',

  mixins: [
    Request],

  props: {
    visible: {
      type: Boolean,
      default: false
    }

  },

  data() {
    return {
      awsMessage: 'us-east-1',
      twoFactorForm: {
        token: ''
      },
      twoFactorRules: {
        token: [
          {required: true, message: 'Please add your Token', trigger: 'submit'}
        ]
      },
      tempSessionToken: '',
      showToken: false,
      isLogginIn: false,
      isLoadingTwoFactor: false,
      oauthWindow: '',
      oauthCode: '',
      showOrcidError: false,
    }
    //showOrcidError: false,
    //note: above should be within "two factor rules"
  },

  methods: {
    ...mapActions(['login']),
    /**
     * Closes dialog
     */
    closeDialog: function() {
      this.$emit('close-login-dialog')
    },

    onLoginWithORCID: async function(x) {
      x.preventDefault()
      await this.$store.dispatch('login', 'ORCID')
    },

    /**
     * On changelog save, emitted from the MarkdownEditor embedded component, so may need to change location
     * Make a request to the API to save the changelog
     *MUST EDIT THIS ACCORDINGLY
     * @params {String} markdown
     */
    onChangelogSave: function(markdown) {
      fetch(this.datasetReadmeUrl, {
        body: JSON.stringify({
          readme: markdown
        }),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': this.datasetDescriptionEtag,
        }
      })
        .then(response => {
          if (response.ok) {
            this.setDatasetDescriptionEtag(response.headers.get('etag'))
            this.setDatasetDescription(markdown).finally(() => {
              this.isSavingMarkdown = false
              this.isEditingMarkdown = false
            })
          } else if (response.status === 412) {
            this.isSavingMarkdown = false
            this.$refs.staleUpdateDialog.dialogVisible = true
          } else {
            throw response
          }
        })
        .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

.el-dialog__body {
  padding: 0;
}
.el-dialog__header {
  display: none;
}

.discover-banner {
  background: #edf1fc;
  padding: 8px;
  text-align: center;
}

    .login-class-container {
        padding: 2px;
    }

.login-class-dialog {
  .download-dataset-container {
    display: flex;
    word-break: normal;
  }



  .buttons {
    text-align: center;
  }

  @media screen and (max-width: 767px) {
    .buttons {
      display: flex;
      flex-direction: row;
    }
  }

  @media screen and (max-width: 767px) {
    ::v-deep .bf-button {
      &.secondary {
        width: 30%;
      }
    }
  }

  a {
    text-decoration: none;
    &:hover {
      text-decoration: none;
    }
  }

  .aws-container {
    text-align: center;
    margin: 40px 48px;
    margin-top: 47px;

    &__download-dataset-size {
      margin-top: 35px;
    }

    .copy-button {
      border: none;
      background: transparent;
      cursor: pointer;
      img {
        width: 20px;
        height: 20px;
      }
    }
  }

  .disclosure-text-block {
    display: flex;
    p {
      font-size: 12px;
      width: 90%;
      line-height: 16px;
    }

    ::v-deep .bf-button {
      min-width: 80px;
      &.secondary {
        width: 6%;
        padding-left: 0;
        padding-right: 0;
      }
    }
  }

  .download-container {
    background-color: $median;
    box-sizing: border-box;
    flex-shrink: 0;
    color: #fff;
    width: 316px;
    overflow: hidden;
    position: relative;
    padding: 40px 40px 0;

    &__download-dataset-size {
      margin-top: 35px;
      margin-bottom: 200px;
    }



    h1 {
      line-height: 32px;
      color: #fff;
      font-size: 24px;
      font-weight: 500;
      margin: 0;
      margin-bottom: 25px;
    }

    p {
      line-height: 24px;
      color: #fff;
      font-size: 16px;
    }
  }

  .close-dialog {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    position: absolute;
    right: 41px;
  }

  .close-icon {
    margin-top: 26px;
    margin-right: -12px;
  }

  h1 {
    line-height: 36px;
    color: $midnight;
    font-size: 28px;
    font-weight: normal;
    margin-bottom: 8px;
  }

  p {
    color: #000000;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: -4px;
  }

  .centered-spaced {
    text-align: center;
    margin-bottom: 20px;
    margin-top: 30px;
  }
    .head-spaced{
        text-align: center;
    }

  #login-orcid-button{
    border: 1px solid #d3d3d3;
    padding: 0.3em;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 1px 1px 3px #999;
    cursor: pointer;
    color: #999;
    font-weight: bold;
    font-size: 0.8em;
    line-height: 24px;
    vertical-align: middle;
  }

  #login-orcid-button:hover{
    border: 1px solid #338caf;
    color: #338acf;
  }

  #orcid-id-icon {
    display: block;
    margin: 0 0.5em 0 0;
    padding: 0;
    float: left;
  }
  h2 {
    color: #000000;
    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
    margin: 0 0 8px;
    margin-top: 15px;
  }

  .text-block {
    border-radius: 2px;
    background-color: #f5f7fa;
    padding: 6px 6px 6px 6px;
    margin-bottom: 16px;
    font-family: monospace;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    border-radius: 4px;
    color: #000;

    &.aws {
      margin-bottom: 36px;
    }
  }

  ::v-deep .el-dialog {
    border-radius: 0;
    width: 868px;

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__header {
      padding: 0;
      border-bottom: none;
    }
  }
}
</style>
