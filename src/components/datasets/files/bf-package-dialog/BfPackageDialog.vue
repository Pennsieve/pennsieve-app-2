<template>
  <el-dialog
    :visible.sync="visible"
    data-cy="bfPackageDialog"
    class="bf-package-dialog"
    :show-close="false"
    @open="onOpen"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      data-cy="bfPackageDialogTitle"
      :title="dialogText"
    />

    <dialog-body>
      <el-form
        ref="packageForm"
        :model="packageForm"
        :rules="rules"
        @submit.native.prevent="submitForm('packageForm')"
      >
        <el-form-item
          label="Name"
          prop="name"
        >
          <el-input
            v-model="packageForm.name"
            data-cy="collectionName"
            autofocus
            :maxlength="255"
          />

          <template
            slot="error"
            slot-scope="error"
          >
            <!-- eslint-disable-next-line --><!-- $sanitize in use -->
            <div class="el-form-item__error" v-html="$sanitize(error.error, ['a'])" />
          </template>
        </el-form-item>
      </el-form>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        data-cy="closeCollectionDialog"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        data-cy="createCollection"
        @click="submitForm('packageForm')"
      >
        {{ dialogText }}
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
  import Request from '../../../../mixins/request/index'
  import AutoFocus from '../../../../mixins/auto-focus'
  import CheckUniqueNames from '../../../../mixins/check-unique-names/index'
  import SanitizeName from '../../../../mixins/sanitize-name/index'
  import EventBus from '../../../../utils/event-bus'
  import { isValidPackageName } from '@/utils/namingConventions'
  import { mapGetters } from 'vuex'
  import { pathOr, pathEq, equals } from 'ramda'

  export default {
    name: 'BfPackageDialog',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton
    },

    mixins: [
      AutoFocus,
      Request,
      CheckUniqueNames,
      SanitizeName
    ],

    props: {
      parentFolder: {
        type: Object,
        default: () => {
          return {}
        }
      },
      files: {
        type: Array,
        default: function() {
          return []
        }
      }
    },

    data: function() {
      return {
        file: {},
        visible: false,
        packageForm: {
          name: ''
        },
        rules: {
          name: [
            { required: true, validator: this.validateName, trigger: 'false' },
          ]
        },
        isDuplicate: false
      }
    },

    computed: {
      ...mapGetters([
        'userToken',
        'config'
      ]),
      /**
       * Computes form URL based on type of action user is taking (rename vs creating)
       * @returns {String}
       */
      formUrl: function() {
        if (this.config.apiUrl && this.userToken) {
          const id = pathOr('', ['content', 'id'], this.file)

          const url = id ?
            `${this.config.apiUrl}/packages/${id}?api_key=${this.userToken}` :
            `${this.config.apiUrl}/packages?api_key=${this.userToken}`

          return url
        }
      },
      /**
       * Compute dialog text
       * @returns {String}
       */
      dialogText: function() {
        const isFolder = pathEq(['content', 'packageType'], 'Collection', this.file)
        const packageHeading = isFolder ? 'Folder' : 'File'
        return this.isRenaming ? `Rename ${packageHeading}` : 'Create Folder'
      },

      /**
       * Compute if the user is renaming a file
       * @returns {Boolean}
       */
      isRenaming: function() {
        return Boolean(Object.keys(this.file).length)
      }
    },

    mounted() {
      EventBus.$on('rename-file', this.openRenameFile.bind(this))
    },

    beforeDestroy() {
      EventBus.$off('rename-file', this.openRenameFile.bind(this))
    },

    methods: {
      /**
       * Opens the dialog and sets the file
       */
      openRenameFile: function(file) {
        this.file = file
        this.visible = true
      },
      /**
       * On dialog open. Ensure the form field is
       */
      onOpen: function() {
        this.autoFocus()
        this.$nextTick(() => {
          this.packageForm.name = pathOr('', ['content', 'name'], this.file)
        })
      },

      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.visible = false
        this.file = {}
        this.$refs.packageForm.resetFields()
      },

      /**
       * Submit Form
       * @param {String} formName
       */
      submitForm: function(formName) {
        this.isDuplicate = false

        this.$refs[formName]
          .validate((valid) => {
            if (!valid) {
              return
            }
            if (this.isRenaming) {
              this.renamePackage()
            } else {
              this.createFolder()
            }
          })
      },

      /**
       * Sends XHR request to create dataset
       */
      renamePackage: function() {
        const fileName = pathOr('', ['content', 'name'], this.file)
        if (fileName === this.packageForm.name) {
          this.closeDialog()
          return
        }

        if (this.formUrl) {
          this.sendXhr(this.formUrl, {
            method: 'PUT',
            body: this.packageForm
          })
          .then(response => {
            this.$emit('file-renamed', response)
            this.closeDialog()
          })
          .catch(response => {
            if (response.status === 500) {
              response.text()
              .then(data => {
                this.isDuplicate = data.indexOf('package name is already taken') >= 0

                // Validate form again to show error
                this.$refs.packageForm.validate()
              })
            }
          })
        }
      },

      /**
       * Sends XHR request to create dataset
       */
      createFolder: function() {
        if (this.formUrl) {

          const parent = pathOr('', ['content', 'id'])(this.parentFolder);
          const datasetId = pathOr('', ['content', 'datasetId'])(this.parentFolder);

          let dataParams = {
            parent,
            dataset: datasetId,
            packageType: 'Collection'
          };

          if(this.parentFolder.content.packageType === 'DataSet') {
            dataParams = {
              dataset: parent,
              packageType: 'Collection'
            }
          }

          const body = Object.assign({}, this.packageForm, dataParams)

          this.sendXhr(this.formUrl, {
            method: 'POST',
            body
          })
          .then(response => {
            this.$emit('folder-created', response)
            this.closeDialog()
          })
          .catch(response => {
            this.handleXhrError(response)
          })
        }
      },

      /**
       * Validate name
       * @param {Object} rule
       * @param {String} value
       * @param {Function} callback
       */
      validateName: function(rule, value, callback) {
        const packageType = pathOr('Collection', ['content', 'packageType'], this.file)
        // Get list based on the file's packageType
        const list = this.filterFiles(packageType === 'Collection')
        const isUnique = this.checkUniqueName(list, ['content', 'name'], value, value)
        const isValidName = isValidPackageName(value)
        if (value === '') {
          callback(new Error('Please provide name'))
        } else if (!isValidName) {
          callback(new Error('This is not a valid filename. Find out more <a href="https://docs.pennsieve.io/" target="_blank">here</a>.'))
        } else if (!isUnique || this.isDuplicate) {
          callback(new Error('Name must be unique'))
        } else {
          callback()
        }
      },

      /**
       * Get all collections or everything but collections
       * @returns {Array}
       */
      filterFiles: function(collectionsOnly) {
        return this.files.filter(item => {
          const packageType = pathOr('', ['content', 'packageType'], item)
          return equals(packageType, 'Collection') === collectionsOnly
        })
      }
    }
  }
</script>

<style scoped lang="scss">
</style>
