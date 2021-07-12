<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    class="create-new-dataset-dialog"
    @open="handleOpen"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Create Dataset"
    />

    <!--      <div-->
    <!--        v-if="hasTemplates && step === 1"-->
    <!--        class="step-1 dataset-template-select"-->
    <!--      >-->
    <!--        <div-->
    <!--          class="dataset-template-select-item"-->
    <!--          :class="templateSelection === 'blank' ? 'selected' : ''"-->
    <!--          @click.prevent="onTemplateClick('blank')"-->
    <!--        >-->
    <!--          <h2>Blank Dataset</h2>-->
    <!--          <p>Start with an empty dataset.</p>-->
    <!--          <hr>-->
    <!--        </div>-->
    <!--        <div-->
    <!--          v-for="item in datasetTemplates"-->
    <!--          :key="item.id"-->
    <!--          class="dataset-template-select-item"-->
    <!--          :class="item.id === templateSelection ? 'selected' : ''"-->
    <!--          @click.prevent="onTemplateClick(item.id)"-->
    <!--        >-->
    <!--          <h2>{{ item.name }}</h2>-->
    <!--          <p>{{ item.description }}</p>-->
    <!--          <hr>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <div-->
    <!--        v-else-->
    <!--        class="step-2"-->
    <!--      >-->
    <dialog-body>

      <!-- Step 1 -->
      <el-form
        v-show="shouldShow(1)"
        ref="newDatasetFormStep1"
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

      <!-- Step 2 -->
      <el-form
        v-show="shouldShow(2)"
        ref="newDatasetFormStep2"
        :model="newDatasetForm"
        :rules="rules"
        @submit.native.prevent="createDataset('newDatasetForm')"
      >
        <div
          class="section-title">
          Manage Integrations
        </div>
        <p
          class="section-description">
          Integrations allow external services to be notified when certain events occur on Pennsieve.
          <span v-show="hasDefaultIntegrations">Some integrations are turned on by default by the <span class="org-name">{{activeOrganization}}</span> Administrators.</span>
        </p>

        <div
          class="integration-list">
          <integration-item-small
            v-for="integration in integrations"
            :key="integration.id"
            :integration="integration"
            :open-index="openIndex"
            v-on:updateIsActive="updateIsActive"
          />
        </div>


        <el-form-item prop="acknowledgeInfo"
          v-show="hasActiveIntegrations">
          <el-checkbox
            class="acknowledgeInfo"
            v-model="acknowledgeInfo"
            label="I acknowledge events will be shared with a third party"
          />
        </el-form-item>

      </el-form>


    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        tabindex="4"
        class="secondary"
        @click="advanceStep(-1)"
      >
        {{ stepBackText }}
      </bf-button>
<!--      <div v-if="step === 1">-->
<!--        <bf-button-->
<!--          :disabled="!templateSelection"-->
<!--          @click="onContinue"-->
<!--        >-->
<!--          Continue-->
<!--        </bf-button>-->
<!--        <router-link-->
<!--          v-if="hasAdminRights"-->
<!--          class="manage-datasets"-->
<!--          :to="{ name: 'settings' }"-->
<!--        >-->
<!--          Manage Dataset Templates-->
<!--        </router-link>-->
<!--      </div>-->
      <bf-button
        :disabled="isCreating"
        :processing="isCreating"
        processing-text="Creating Dataset"
        @click="advanceStep(1)">
        {{ createText }}
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
  import { mapGetters, mapState, mapActions } from 'vuex'
  import { clone, propOr, pathOr } from 'ramda'

  import A11yKeys from '../../../shared/a11y-keys/A11yKeys.vue'
  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import CharacterCountInput from '../../../shared/CharacterCountInput/CharacterCountInput.vue'
  import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
  import IntegrationItemSmall from "./IntegrationItemSmall.vue";

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
      CharacterCountInput,
      IntegrationItemSmall
    },

    mixins: [
      Request,
      AutoFocus,
      CheckUniqueNames,
      SanitizeName
    ],

    mounted: function() {
    },

    props: {
      visible: Boolean,
      datasets: Array,
      integrations: Array
    },

    data: function() {
      return {
        processStep: 1,
        openIndex:0,
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
        isCreating: false,
        acknowledgeInfo: false,
        hasActiveIntegrations: false
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
        'hasFeature',
        'getActiveOrganization'
      ]),

      hasDefaultIntegrations: function() {
        return this.integrations.map(x => x.isDefault).some( (x) => x === true)
      },

      activeOrganization :function() {
        if (this.getActiveOrganization().organization) {
          return  this.getActiveOrganization().organization.name
        } else {
          return ''
        }
      },

      createText: function() {
        return this.processStep > 1 ? 'Create Dataset' : 'Continue'
      },

      stepBackText: function() {
        return this.processStep > 1 ? 'Back' : 'Cancel'
      },

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
      },
    },

    methods: {
      ...mapActions([
        'addDataset',
        'updateOnboardingEvents'
      ]),
      updateIsActive: function(value) {
        this.integrations.filter(n => n.id === value.id)[0].isActive = value.isActive
        this.checkActiveIntegrations()

      },
      checkActiveIntegrations: function() {
        this.hasActiveIntegrations = this.integrations.map(x => x.isActive).some( (x) => x === true)
      },
      /**
       * Determines button action
       * @param {String} key
       */
      advanceStep: function(step) {
        this.processStep += step
        if (this.processStep === 0) {
          this.closeDialog()
        }
        if (this.processStep === 3) {
          this.createDataset('newDatasetForm')
        }
      },

      /**
       * Determines which step content is active
       * @param {String} key
       * @returns {Boolean}
       */
      shouldShow: function(key) {
        return this.processStep === key
      },

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
        this.openIndex += 1
        for (let x in this.integrations) {
          this.integrations[x].isActive = this.integrations[x].isDefault
        }
      },
      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.$emit('close-dialog')
        this.duplicateName = false
        for (let x in this.integrations) {
          this.integrations[x].isActive = this.integrations[x].isDefault
        }

        setTimeout(() => {
          this.processStep = 1
          this.$refs.newDatasetFormStep1.resetFields()
          this.$refs.newDatasetFormStep2.resetFields()
        })

        // // form ref is only available in step 2
        // if (this.step === 2) {
        //   this.$refs.newDatasetFormStep1.resetFields()
        // }

        // if (this.hasTemplates) {
        //   // scroll dataset templates section to top
        //   const scrollEl = this.$el.querySelector('.el-dialog__body')
        //   scrollEl.scrollTop = 0
        // }

        // this.hasTemplates ? this.step = 1 : this.step = 2
        // this.templateSelection = ''
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

.el-dialog__header, .el-dialog__body {
  padding: 24px 24px 32px 0;

}


.acknowledgeInfo {
  color: $gray_5;
}

.integration-list {
  max-height: 300px;
  overflow: scroll;
}
.section-title {
  color: $gray_5;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.section-description {
  margin-bottom: 40px;
  color:$gray_5;
}

.org-name {
  color: $purple_1;
  font-weight: 500;
}

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
    background: $gray_2;
    hr {
      border-top-color: $gray_2;
    }
  }

  &.selected {
    color: white;
    background: $purple_1;

    h2 {
      color: white;
    }

    hr {
      border-top-color: $purple_1;
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

<!--<style lang="scss">-->
<!--.create-new-dataset-dialog {-->
<!--  &.step-1 {-->
<!--    .el-dialog__body {-->
<!--      max-height: 250px;-->
<!--      overflow-y: scroll;-->
<!--      padding: 0 0 24px;-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->


