<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    class="create-new-dataset-dialog"
    :class="[ step === 1 ? 'step-1' : 'step-2' ]"
    @open="handleOpen"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Create Dataset"
    />

    <dialog-body>
      <div
        v-if="hasTemplates && step === 1"
        class="step-1 dataset-template-select"
      >
        <div
          class="dataset-template-select-item"
          :class="templateSelection === 'blank' ? 'selected' : ''"
          @click.prevent="onTemplateClick('blank')"
        >
          <h2>Blank Dataset</h2>
          <p>Start with an empty dataset.</p>
          <hr>
        </div>
        <div
          v-for="item in datasetTemplates"
          :key="item.id"
          class="dataset-template-select-item"
          :class="item.id === templateSelection ? 'selected' : ''"
          @click.prevent="onTemplateClick(item.id)"
        >
          <h2>{{ item.name }}</h2>
          <p>{{ item.description }}</p>
          <hr>
        </div>
      </div>
      <div
        v-else
        class="step-2"
      >
        <el-form
          ref="newDatasetForm"
          :model="newDatasetForm"
          :rules="rules"
          @submit.native.prevent="createDataset('newDatasetForm')"
        >
          <el-form-item
            label="Dataset Name"
            prop="name"
          >
            <el-input
              v-model="newDatasetForm.name"
              autofocus
              :maxlength="255"
            />
          </el-form-item>
          <el-form-item
            label="Subtitle"
            prop="description"
          >
            <character-count-input
              v-model="newDatasetForm.description"
              :rows="4"
            />
          </el-form-item>
        </el-form>
      </div>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        tabindex="4"
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <div v-if="step === 1">
        <bf-button
          :disabled="!templateSelection"
          @click="onContinue"
        >
          Continue
        </bf-button>
        <router-link
          v-if="hasAdminRights"
          class="manage-datasets"
          :to="{ name: 'settings' }"
        >
          Manage Dataset Templates
        </router-link>
      </div>
      <bf-button
        v-else
        :disabled="isCreating"
        :processing="isCreating"
        processing-text="Creating Dataset"
        @click="createDataset('newDatasetForm')"
      >
        Create Dataset
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
  import { mapGetters, mapState, mapActions } from 'vuex'
  import { prop, propOr, pathOr } from 'ramda'

  import A11yKeys from '../../../shared/a11y-keys/A11yKeys.vue'
  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import CharacterCountInput from '../../../shared/CharacterCountInput/CharacterCountInput.vue'
  import DialogBody from '../../../shared/dialog-body/DialogBody.vue'

  import CheckUniqueNames from '../../../../mixins/check-unique-names'
  import SanitizeName from '../../../../mixins/sanitize-name'
  import Request from '../../../../mixins/request'
  import AutoFocus from '../../../../mixins/auto-focus'

  import EventBus from '../../../../utils/event-bus'

  export default {
    name: 'BfCreateNewDataset',

    components: {
      A11yKeys,
      BfButton,
      BfDialogHeader,
      DialogBody,
      CharacterCountInput
    },

    mixins: [
      Request,
      AutoFocus,
      CheckUniqueNames,
      SanitizeName
    ],

    props: {
      visible: Boolean,
      datasets: Array
    },

    data: function() {
      return {
        newDatasetForm: {
          name: '',
          description: ''
        },
        rules: {
          name: [
            { required: true, validator: this.validateName, trigger: 'false' },
          ]
        },
        duplicateName: false,
        step: 2,
        templateSelection: '',
        isCreating: false
      }
    },

    computed: {
      ...mapState([
        'userToken',
        'config',
        'onboardingEvents',
        'datasetTemplates',
        'activeOrganization'
      ]),

      ...mapGetters([
        'hasFeature'
      ]),

      /**
       * Compute create dataset url
       * @returns {String}
       */
      createDatasetsUrl: function() {
        if (this.config.apiUrl && this.userToken) {
          return `${this.config.apiUrl}/datasets?api_key=${this.userToken}`
        }
      },

      /**
       * Onboarding Events Url
       * @returns {String}
       */
      onboardingEventsUrl: function() {
        const apiUrl = propOr('', 'apiUrl', this.config)
        if (apiUrl && this.userToken) {
          return `${apiUrl}/onboarding/events?api_key=${this.userToken}`
        }
      },

      /**
       * Compute if user has dataset templates
       * @returns {Boolean}
       */
      hasTemplates: function() {
        return this.hasFeature('dataset_templates_feature') && this.datasetTemplates.length > 0
      },

      /**
       * Computes whether or not user has administratrive rights for the organization
       * @returns {Boolean}
       */
      hasAdminRights: function() {
        const isAdmin = propOr(false, 'isAdmin', this.activeOrganization)
        const isOwner = propOr(false, 'isOwner', this.activeOrganization)
        return isAdmin || isOwner
      },

      /**
       * Compute url for creating a dataset from a template
       * @returns {String}
       */
      createDatsetFromTemplateUrl: function() {
        const orgId = pathOr('', ['organization', 'intId'], this.activeOrganization)
        const templateId = this.templateSelection

        if (!orgId || !templateId) {
          return ''
        }

        return `${this.config.apiUrl}/model-schema/organizations/${orgId}/dataset-templates/${templateId}`
      }
    },

    watch: {
      hasTemplates: {
        handler: function(val) {
          if (val === true) {
            this.step = 1
          } else {
            this.step = 2
          }
        },
        immediate: true
      }
    },

    methods: {
      ...mapActions([
        'addDataset',
        'updateOnboardingEvents'
      ]),

      /**
       * Handles key-pressed event
       * @param {Object} evt
       */
      handleKeyPress: function(evt) {
        evt.preventDefault()
        this.createDataset('newDatasetForm')
      },
      /**
       * Resets the form
       */
      handleOpen: function() {
        this.autoFocus()
      },
      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.$emit('close-dialog')
        this.duplicateName = false

        // form ref is only available in step 2
        if (this.step === 2) {
          this.$refs.newDatasetForm.resetFields()
        }

        if (this.hasTemplates) {
          // scroll dataset templates section to top
          const scrollEl = this.$el.querySelector('.el-dialog__body')
          scrollEl.scrollTop = 0
        }

        this.hasTemplates ? this.step = 1 : this.step = 2
        this.templateSelection = ''
      },
      /**
       * Create Dataset
       * @param {String} formName
       */
      createDataset: function(formName) {
        this.duplicateName = false

        this.$refs[formName]
          .validate((valid) => {
            if (!valid) {
              return
            }
            this.sendRequest()
          })
      },
      /**
       * Sends XHR request to create dataset
       */
      sendRequest: function() {
        this.isCreating = true
        const url = !this.templateSelection || this.templateSelection === 'blank' ? this.createDatasetsUrl : this.createDatsetFromTemplateUrl

        this.sendXhr(url, {
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.userToken}`
          },
          body: this.newDatasetForm
        })
        .then(this.handleSuccess.bind(this))
        .catch(err => {
          this.isCreating = false
          this.handleError(err)
        })
      },
      /**
       * Handles successful dataset creation ajax
       * @param {Object} response
       */
      handleSuccess: function(response) {
        this.addDataset(response).then(() => {
          this.closeDialog('newDatasetForm')

          // check for onboarding event state for creating a dataset
          if (this.onboardingEvents.indexOf('CreatedDataset') === -1){
            // make post request
            this.sendOnboardingEventsRequest()
          }

          EventBus.$emit('track-event', {
            name: 'Dataset Created'
          })

          const id = pathOr('', ['content', 'id'], response)
          this.$router.push({ name: 'dataset', params: { datasetId: id }})
          this.isCreating = false
        })
      },
      /**
       * Handles error dataset creation ajax
       * @param {Object} response
       */
      handleError: function(response) {
        if (response.status === 400) {
          this.duplicateName = true
          this.$refs.newDatasetForm.validate()
        }
      },
      /**
       * Validate name
       * @param {Object} rule
       * @param {String} value
       * @param {Function} callback
       */
      validateName: function(rule, value, callback) {
        const isUnique = this.checkUniqueName(this.datasets, ['content', 'name'], value, '')
        const hasReservedChars = this.containsReservedChars(value)
        if (value === '') {
          callback(new Error('Please provide a name'))
        } else if (value.length > 255) {
          callback(new Error('Dataset name must be less than 255 characters'))
        } else if (hasReservedChars) {
          callback(new Error(`A dataset name cannot contain any of the following characters: ${ this.reservedCharsStr }`))
        } else if  (!isUnique || this.duplicateName) {
          callback(new Error('A dataset with this name already exists'))
        } else {
          callback()
        }
      },
      /**
       * Save onboarding event
       */
      sendOnboardingEventsRequest: function() {
        this.sendXhr(this.onboardingEventsUrl, {
            method: 'POST',
            body: 'CreatedDataset',
            header: {
              'Authorization': `bearer ${this.userToken}`
            }
          })
          .then(response => {
            const onboardingEvents = [...this.onboardingEvents, 'CreatedDataset']
            this.updateOnboardingEvents(onboardingEvents)
          })
          .catch(this.handleXhrError.bind(this))
      },
      /**
       * Handle dataset template selection
       * @param {String} templateSelection
       */
      onTemplateClick: function(templateSelection) {
        this.templateSelection = templateSelection
      },
      /**
       * Handle continue button click
       */
      onContinue: function() {
        this.step = 2
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "../../../../assets/_variables.scss";

.dataset-template-select-item {
  padding-top: 16px;
  cursor: pointer;

  h2 {
    margin-bottom: 8px;
  }

  h2, p {
    padding: 0 32px;
  }

  hr {
    margin: 16px 0 0;
  }

  &:hover {
    background: $cortex;
    hr {
      border-top-color: $cortex;
    }
  }

  &.selected {
    color: white;
    background: $dopamine;

    h2 {
      color: white;
    }

    hr {
      border-top-color: $dopamine;
    }
  }
}

.dataset-template-select-item:last-of-type {
  hr {
    opacity: 0;
  }
}

.manage-datasets {
  position: absolute;
  right: 32px;
  bottom: 24px;
}

.icon-help-processing {
  margin-bottom: 3px;
  margin-left: 4px;
}
</style>

<style lang="scss">
.create-new-dataset-dialog {
  &.step-1 {
    .el-dialog__body {
      max-height: 250px;
      overflow-y: scroll;
      padding: 0 0 24px;
    }
  }
}
</style>


