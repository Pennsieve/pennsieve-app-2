<template>
  <bf-dialog
    class="bf-upload-external-file"
    :open="visible"
    :show-close="false"
    title="Link to External File"
    @open="handleOpen"
    @close="closeDialog"
  >
    <div slot="body">
      <el-form
        ref="linkToExternalFileForm"
        :model="form"
        :rules="formRules"
        @submit.native.prevent="onSubmit"
        @keyup.enter.native="onSubmit"
      >
        <el-form-item prop="fileName">
          <template slot="label">
            File Name
            <span class="label-helper">
              required
            </span>
          </template>
          <el-input
            v-model="form.fileName"
            placeholder="Enter a file name"
            autofocus
          />
        </el-form-item>
        <el-form-item prop="externalLink">
          <template slot="label">
            External Link
            <span class="label-helper">
              required
            </span>
          </template>
          <el-input
            v-model="form.externalLink"
            placeholder="Enter the URL or file path"
          />
        </el-form-item>
        <el-form-item
          label="Description"
          prop="description"
        >
          <character-count-input
            v-model="form.description"
            placeholder="Enter a description"
            :rows="4"
          />
        </el-form-item>
      </el-form>
    </div>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        :processing="isProcessing"
        processing-text="Saving"
        @click="onSubmit"
      >
        Save
      </bf-button>
    </div>
  </bf-dialog>
</template>

<script>
// 3rd party libraries
import { mapState } from 'vuex'
import { pathOr } from 'ramda'

// Blackfynn components
import BfButton from '../shared/bf-button/BfButton.vue'
import BfDialog from '../shared/bf-dialog/bf-dialog.vue'
import CharacterCountInput from '../shared/CharacterCountInput/CharacterCountInput.vue'

// Blackfynn mixins
import AutoFocus from '../../mixins/auto-focus'
import Request from '../../mixins/request'

// Blackfynn utils
import EventBus from '../../utils/event-bus.js'

export default {
  name: 'BfUploadExternalFile',

  components: {
    BfButton,
    BfDialog,
    CharacterCountInput
  },

  mixins: [
    AutoFocus,
    Request
  ],

  props: {
    externalFile: {
      type: Object,
      default: function() {
        return {}
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isProcessing: false,
      form: {
        fileName: '',
        externalLink: '',
        description: ''
      },
      formRules: {
        fileName: [{ required: true, message: 'File Name is required', trigger: 'false' }],
        externalLink: [{ required: true, message: 'External Link is required', trigger: 'false' }]
      }
    }
  },

  computed: {
    ...mapState([ 'config', 'dataset', 'profile', 'userToken', 'filesProxyId' ]),

    /**
     * Compute the upload url
     * @returns {String}
     */
    url: function() {
      return `${this.config.apiUrl}/packages`
    },

    /**
     * Compute if user is editing file
     * @returns {Boolean}
     */
    isEditing: function() {
      return Boolean(pathOr('', ['externalFile', 'location'], this.externalFile))
    }
  },

  watch: {
    externalFile: {
      handler: function(val) {
        if (val.externalFile) {
          this.form.fileName = val.content.name
          this.form.externalLink = val.externalFile.location
          this.form.description = val.externalFile.description
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Emit close-external-file-modal event
     */
    closeDialog: function() {
      EventBus.$emit('close-external-file-modal')
      this.$refs.linkToExternalFileForm.clearValidate()
      this.reset()
    },

    /**
     * Handle form submit event and form validation
     */
    onSubmit: function() {
      this.$refs.linkToExternalFileForm.validate(valid => {
        if (!valid) {
          return
        }

        this.isProcessing = true

        const dataset = pathOr('', ['content', 'id'], this.dataset)
        const collectionId = pathOr('', ['params', 'fileId'], this.$route)

        let url = `${this.url}?api_key=${this.userToken}`
        let method = 'POST'
        const body = {
          dataset,
          description: this.form.description,
          externalLocation: this.form.externalLink,
          name: this.form.fileName,
          owner: this.profile.id,
          packageType: 'EXTERNAL',
          state: 'READY'
        }

        if (collectionId) {
          body.parent = collectionId
        }

        if (this.isEditing) {
          method = 'PUT'
          url = `${this.url}/${this.externalFile.content.id}?api_key=${this.userToken}`
        }

        this.sendXhr(url, {
          method,
          body
        })
        .then(this.handleXhrSuccess.bind(this))
        .catch(err => {
          this.handleXhrError(err)

          this.isProcessing = false

          EventBus.$emit('close-external-file-modal')

          EventBus.$emit('toast', {
            detail: {
              msg: 'There was an error linking your file',
              type: 'error'
            }
          })
        })
      })
    },

    /**
     * Handle xhr success response
     * @param {Object} response
     */
    handleXhrSuccess: function(response) {
      this.isProcessing = false
      this.reset()
      EventBus.$emit('close-external-file-modal')

      const id = pathOr('', ['content', 'id'], response)

      if (this.isEditing) {
        EventBus.$emit('update-external-file', response)
      } else {
        this.$router.push({
          name: 'file-record',
          params: {
            conceptId: this.filesProxyId,
            instanceId: id
          }
        })
      }

    },

    /**
     * Re-focus file name input on open
     */
    handleOpen: function() {
      this.autoFocus()
    },

    /**
     * Reset form
     */
    reset: function() {
      this.form = {
        fileName: '',
        externalLink: '',
        description: ''
      }
    }
  }
}
</script>

<style lang="scss">
.bf-upload-external-file {
  .bf-dialog-wrap {
    height: auto !important;
  }
}
</style>
