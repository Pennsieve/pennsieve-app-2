<template>
  <bf-dialog
    class="create-dataset-template-dialog"
    :open="visible"
    :show-close="false"
    :title="titleText"
    @open="autoFocus"
    @close="closeDialog"
  >
    <div slot="body">
      <div
        v-if="step === 1"
        class="step-1"
      >
        <img
          slot="icon"
          src="/static/icons/icon-gallery.svg"
          class="icon-gallery"
          height="48"
          width="96"
          alt="Gallery Icon"
        >
        <p>Publishing a Dataset allows you to share are models, properties and relationship types from this dataset with everyone in {{ orgName }}.</p>
      </div>
      <div
        v-else
        class="step-2"
      >
        <el-form
          ref="createDatasetTemplateForm"
          :model="form"
          :rules="formRules"
          @submit.native.prevent="onSubmit"
          @keyup.enter.native="onSubmit"
        >
          <el-form-item
            label="Template Name"
            prop="name"
          >
            <el-input
              v-model="form.name"
              autofocus
            />
          </el-form-item>
          <el-form-item
            label="Subtitle"
            prop="description"
          >
            <character-count-input
              v-model="form.description"
              :show-warning="showCharCount"
              :rows="4"
            />
          </el-form-item>
        </el-form>
      </div>
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
        v-if="step === 1"
        @click="onNextStep"
      >
        Continue
      </bf-button>
      <bf-button
        v-else
        :processing="isProcessing"
        :processing-text="!isEditing ? 'Creating' : 'Updating'"
        @click="onSubmit"
      >
        {{ !isEditing ? 'Create' : 'Update' }}
      </bf-button>
    </div>
  </bf-dialog>
</template>

<script>
  // 3rd party libraries
  import snakeCase from 'lodash.snakecase'
  import { propOr, pathOr } from 'ramda'
  import { mapGetters, mapActions, mapState } from 'vuex'

  // Pennsieve components
  import BfButton from '../../../../shared/bf-button/BfButton.vue'
  import BfDialog from '../../../../shared/bf-dialog/bf-dialog.vue'
  import CharacterCountInput from '../../../../shared/CharacterCountInput/CharacterCountInput.vue'

  // Pennsieve mixins
  import Request from '../../../../../mixins/request/index'
  import AutoFocus from '../../../../../mixins/auto-focus'
  import checkUniqueName from '../../../../../mixins/check-unique-names'
  import sanitizeName from '../../../../../mixins/sanitize-name'

  // Pennsieve utils
  import EventBus from '../../../../../utils/event-bus.js'

  export default {
    name: 'CreateDatasetTemplateDialog',

    components: {
      BfButton,
      BfDialog,
      CharacterCountInput
    },

    mixins: [
      Request,
      AutoFocus,
      checkUniqueName,
      sanitizeName
    ],

    props: {
      isEditing: {
        type: Boolean,
        default: false
      },
      visible: {
        type: Boolean,
        default: false
      },
      datasetTemplate: {
        type: Object,
        default: function() {
          return {}
        }
      }
    },

    data: function() {
      return {
        isProcessing: false,
        form: {
          name: '',
          description: ''
        },
        formRules: {
          name: [
            { required: true, validator: this.validateName, trigger: 'false' },
          ],
          description: [
            { required: true },
          ]
        },
        step: 1
      }
    },

    computed: {
      ...mapState([
        'userToken',
        'config',
        'dataset',
        'datasetTemplates',
        'activeOrganization'
      ]),

      ...mapGetters([
        'hasFeature',
      ]),

      /**
       * Compute active organization name
       * @returns {String}
       */
      orgName: function() {
        return pathOr('', ['organization', 'name'], this.activeOrganization)
      },

      /**
       * Compute url for POST xhr
       * @returns {String}
       */
      urlCreate: function() {
        const orgId = pathOr('', ['organization', 'intId'], this.activeOrganization)
        const datasetId = pathOr('', ['content', 'intId'], this.dataset)

        if (!orgId || !datasetId) {
          return ''
        }

        return `${this.config.apiUrl}/model-schema/organizations/${orgId}/datasets/${datasetId}/dataset-templates`
      },

      /**
       * Compute url for PUT xhr
       * @returns {String}
       */
      urlUpdate: function() {
        const orgId = pathOr('', ['organization', 'intId'], this.activeOrganization)
        const templateId = propOr('', 'id', this.datasetTemplate)

        if (!orgId || !templateId) {
          return ''
        }

        return `${this.config.apiUrl}/model-schema/organizations/${orgId}/dataset-templates/${templateId}`
      },

      /**
       * Compute modal title text
       * @returns {String}
       */
      titleText: function() {
        return !this.isEditing ? 'Publish Data Model Template' : 'Rename Data Model Template'
      },

      /**
       * Compute if description character count should render
       * @returns {Boolean}
       */
      showCharCount: function() {
        return Boolean(this.form.description)
      }
    },

    watch: {
      datasetTemplate: {
        handler: function(val) {
          if (val.id) {
            this.form = {
              name: val.name,
              description: val.description
            }
          }
        },
        immediate: true
      },
      visible: {
        handler: function(val) {
          if (val && this.isEditing) {
            this.step = 2
          }
        },
        immediate: true
      }
    },

    methods: {
      ...mapActions([
        'addDatasetTemplate',
        'updateDatasetTemplates'
      ]),

      /**
       * Handle form submit event
       */
      onSubmit: function() {
        // short circuit if on first step
        if (this.step === 1) {
          return
        }

        if (this.$refs.createDatasetTemplateForm) {
          // validate form and call xhr function
          this.$refs.createDatasetTemplateForm.validate((valid) => {
            if (!valid) {
              return
            }

            if (!this.isEditing) {
              this.createDatasetTemplate()
            } else {
              this.editDatasetTemplate()
            }
          })
        }
      },

      /**
       * Handle create dataset template
       */
      createDatasetTemplate: function() {
        const { name, description } = this.form

        this.isProcessing = true

        this.sendXhr(this.urlCreate, {
          header: {
            'Authorization': `Bearer ${this.userToken}`
          },
          method: 'POST',
          body: { name, description }
        })
        .then(this.handleCreateDatasetTemplateSuccess.bind(this))
        .catch(err => {
          this.isProcessing = false

          EventBus.$emit('toast', {
            type: 'error',
            msg: 'There was an error creating your Model template.'
          })

          this.handleXhrError(err)
        })
      },

      /**
       * Handle create dataset template xhr success response
       * @param {Object} response
       */
      handleCreateDatasetTemplateSuccess: function(response) {
        this.closeDialog()

        this.isProcessing = false

        EventBus.$emit('track-event', {
          name: 'Dataset Template Created'
        })

        // heap.track('Dataset Template Created', { route: this.$route.path })

        EventBus.$emit('toast', {
          detail: {
            msg: 'Model template successfuly created. You can select your new template by creating a new Dataset.',
            type: 'success',
            duration: 6000,
            class: 'width-auto'
          }
        })

        // update vuex state
        this.addDatasetTemplate(response)
      },

      /**
       * Handle edit dataset template
       */
      editDatasetTemplate: function() {
        const { name, description } = this.form

        this.isProcessing = true

        this.sendXhr(this.urlUpdate, {
          header: {
            'Authorization': `Bearer ${this.userToken}`,
          },
          method: 'PUT',
          body: { name, description }
        })
        .then(this.handleUpdateDatasetTemplateSuccess.bind(this))
        .catch(err => {
          this.isProcessing = false

          EventBus.$emit('toast', {
            type: 'error',
            msg: 'There was an error creating your Model template.'
          })

          this.handleXhrError(err)
        })
      },

      /**
       * Handle update dataset template xhr success response
       * @param {Object} response
       */
      handleUpdateDatasetTemplateSuccess: function(response) {
        // using form data to update vuex as response isn't coming back properly
        const { name, description } = this.form
        const updatedDatasetTemplate = {
          ...this.datasetTemplate,
          name,
          description
        }
        // update vuex state
        this.updateDatasetTemplates(updatedDatasetTemplate)

        this.closeDialog()

        this.isProcessing = false

        EventBus.$emit('toast', {
          detail: {
            msg: 'Model template successfuly updated.',
            type: 'success'
          }
        })
      },

      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.$emit('update:visible', false)
        this.step = 1
        if (this.$refs.createDatasetTemplateForm) {
          this.$refs.createDatasetTemplateForm.resetFields()
        }
      },

      /**
       * Validate name
       * @param {Object} rule
       * @param {String} value
       * @param {Function} callback
       */
      validateName: function(rule, value, callback) {
        const isUnique = this.checkUniqueName(this.datasetTemplates, ['name'], value, '')
        const hasNameChanged = Boolean(this.datasetTemplate.name !== this.form.name)
        const hasReservedChars = this.containsReservedChars(value)
        if (value === '') {
          callback(new Error('Please provide an identifier'))
        } else if (hasReservedChars) {
          callback(new Error(`A dataset name cannot contain any of the following characters: ${ this.reservedCharsStr }`))
        } else if (!isUnique && hasNameChanged) {
          callback(new Error('A dataset template with this name already exists'))
        } else {
          callback()
        }
      },

      /**
       * Advance to step 2
       */
      onNextStep: function() {
        this.step = 2
        this.autoFocus()
      }
    }
  }
</script>

<style lang="scss">
.create-dataset-template-dialog {
  .bf-dialog-body {
    justify-content: center;
  }

  .step-1 {
    text-align: center;

    p {
      margin: 0 auto;
      width: 350px;
    }
  }

  .icon-gallery {
    margin-bottom: 8px;
  }
}
</style>
