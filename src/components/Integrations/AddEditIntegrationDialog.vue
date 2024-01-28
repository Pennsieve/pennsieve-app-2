<template>
  <el-dialog
    :visible="visible"
    class="add-integration-dialog"
    :show-close="false"
    @open="onOpen"
    @close="closeDialog"
    :close-on-click-modal="false"
  >
    <bf-dialog-header slot="title" :title="dialogTitle" />

    <dialog-body>
      <!-- Step 1 -->
      <el-form
        v-show="shouldShow(1, 'All')"
        ref="integrationFormStep1"
        :model="integration"
        :rules="rules"
        @submit.native.prevent="createIntegration"
      >
        <el-form-item prop="displayName">
          <template slot="label">
            Name
            <span class="label-helper">required</span>
          </template>
          <el-input
            v-model="integration.displayName"
            placeholder="For example: Slack, MyExternalService"
            autofocus
          />
        </el-form-item>

        <el-form-item prop="description">
          <template slot="label">
            Description
            <span class="label-helper">required</span>
          </template>
          <character-count-input
            ref="inputDescription"
            v-model="integration.description"
            :rows="5"
            placeholder="Add a description to help others understand what the integration does."
          />
        </el-form-item>

        <el-form-item prop="isPublic">
          <template slot="label">
            Integration permissions
            <span class="label-helper"></span>
            <div class="info">
              Allow the integration to be used by everyone in the organization.
              By default the integration is private and can only be managed by
              the current user.
            </div>
          </template>
          <el-checkbox
            v-model="integration.isPublic"
            label="Enable organization-wide use of integration"
          />
        </el-form-item>

        <el-form-item prop="isDefault" v-show="integration.isPublic">
          <template slot="label">
            Enable by default
            <span class="label-helper"></span>
            <div class="info">
              Enable this integration for all new datasets added to your
              organization. Individual dataset owners can opt-out or turn off.
            </div>
          </template>
          <el-checkbox
            v-model="integration.isDefault"
            label="Enable by default on new datasets"
          />
        </el-form-item>
      </el-form>

      <!-- Step 2 -->
      <div class="form-container" v-show="shouldShow(2, 'All')">
        <el-form ref="integrationFormStep2" :model="integration" :rules="rules">
          <el-form-item prop="integrationType">
            <template slot="label">
              Integration Type
              <span class="label-helper">required</span>
            </template>
            <el-select
              ref="enum"
              v-model="integration.integrationType"
              class="input-property"
              filterable
            >
              <el-option
                v-for="item in typeItems"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item prop="apiUrl">
            <template slot="label">
              API URL
              <span class="label-helper">required</span>
            </template>
            <el-input
              v-model="integration.apiUrl"
              placeholder="http://<myhost>/<webhook-route>"
            />
          </el-form-item>

          <el-form-item prop="imageUrl">
            <template slot="label">
              Image URL
              <span class="label-helper">optional</span>
            </template>
            <el-input
              v-model="integration.imageUrl"
              placeholder="http://<examplehost>/image.jpg"
            />
          </el-form-item>
          <el-form-item prop="targetPath">
            <template slot="label">
              Specify path to folder for output
              <span class="label-helper">optional</span>
            </template>
            <el-input
              v-model="integration.targetPath"
              placeholder="folder/nested-folder/deeply-nested-folder"
            />
          </el-form-item>

          <el-form-item prop="secret">
            <template slot="label">
              Secret
              <span class="label-helper"></span>
              <p class="info">
                This unique string is sent with all published events to this
                webhook and can be used to validate the origin of the message.
              </p>
            </template>
            <el-input
              v-if="showSecret"
              v-model="integration.secret"
              placeholder="TODO: Create secret"
            />
            <bf-button v-else class="secondary" @click="generateSecret">
              Generate new secret
            </bf-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 3 (Webhook) -->
      <div class="form-container" v-show="shouldShow(3, 'Webhook')">
        <el-form ref="integrationFormStep3a">
          <el-form-item prop="triggers">
            <template slot="label">
              Select Triggers
              <span class="label-helper"></span>
            </template>

            <el-checkbox
              v-model="integration.eventTypeList.METADATA"
              class="input-property"
              label="Metadata"
            />
            <div class="check-description">
              Dataset name, subtitle, licences, description, image, references,
              tags, contributors, collections, or ignore files list
            </div>

            <el-checkbox
              v-model="integration.eventTypeList.STATUS"
              class="input-property"
              label="Status"
            />
            <div class="check-description">All changes to dataset status</div>

            <el-checkbox
              v-model="integration.eventTypeList.RECORDS_AND_MODELS"
              class="input-property"
              label="Records and Models"
            />
            <div class="check-description">Creating, managing, or removing</div>

            <el-checkbox
              v-model="integration.eventTypeList.FILES"
              class="input-property"
              label="Files"
            />
            <div class="check-description">Creating, managing, or removing</div>

            <el-checkbox
              v-model="integration.eventTypeList.PERMISSIONS"
              class="input-property"
              label="Permissions"
            />
            <div class="check-description">
              Uploading, managing, or deleting
            </div>

            <el-checkbox
              v-model="integration.eventTypeList.PUBLISHING"
              class="input-property"
              label="Publishing"
            />
            <div class="check-description">
              All stages of publishing process
            </div>
            <el-checkbox
              v-model="integration.eventTypeList.CUSTOM"
              class="input-property"
              label="Custom"
            />
            <div class="check-description">
              Custom events from users and integrations
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 3 (Application) -->
      <div class="form-container" v-show="shouldShow(3, 'Application')">
        <div>
          The application will be available as an action for the selected
          targets. Optionally, you can provide a filter to restrict objects that
          can invoke the application. You can select the same target multiple
          times with different filters. Valid targets include: Dataset, File,
          and Files.
          <br />
          <br />

          <b>Select targets</b>
          <span class="label-helper">required</span>
        </div>

        <el-form
          ref="integrationFormStep3b"
          :model="integration"
          :rules="rules"
        >
          <el-form-item prop="customTargets">
            <div
              v-for="(item, index) in integration.customTargets"
              class="targetOptions"
            >
              <el-select
                ref="enum"
                v-model="item.target"
                class="input-property target"
                filterable
              >
                <el-option
                  v-for="item in customTargets"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-show="showFilter(item.target)"
                ref="enum"
                v-model="item.filter"
                class="input-property filter"
                filterable
              >
                <el-option
                  v-for="item in fileTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-button
                icon="el-icon-minus"
                size="mini"
                @click="removeCustomTarget(index)"
              ></el-button>
            </div>
          </el-form-item>
          <el-button
            icon="el-icon-plus"
            size="mini"
            @click="addCustomTarget"
          ></el-button>
        </el-form>
      </div>
    </dialog-body>

    <!-- Overview buttons -->
    <div slot="footer" class="dialog-footer">
      <bf-button class="secondary" @click="advanceStep(-1)">
        {{ stepBackText }}
      </bf-button>
      <bf-button @click="advanceStep(1)">{{ createText }}</bf-button>
    </div>
  </el-dialog>
</template>

<script>
import snakeCase from 'lodash.snakecase'
import { mapState } from 'vuex'
import { clone } from 'ramda'

import BfButton from '../shared/bf-button/BfButton.vue'
import BfDialogHeader from '../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../shared/dialog-body/DialogBody.vue'
import Request from '../../mixins/request'
import GetDataType from '../../mixins/data-type'
import AutoFocus from '../../mixins/auto-focus'
import checkUniqueName from '../../mixins/check-unique-names'
import CharacterCountInput from '../shared/CharacterCountInput/CharacterCountInput.vue'
import FileTypeMapper from '../../mixins/FileTypeMapper'

/**
 * Returns the default values for a property
 * @returns {Object}
 */
const defaultIntegration = () => ({
  displayName: '',
  description: '',
  apiUrl: '',
  imageUrl: '',
  targetPath: '',
  secret: '',
  isDefault: false,
  isDisabled: false,
  isPublic: false,
  name: '',
  integrationType: 'viewer',
  customTargets: [{ target: 'DATASET', filter: null }],
  eventTypeList: {
    METADATA: false,
    STATUS: false,
    RECORDS_AND_MODELS: false,
    FILES: false,
    PERMISSIONS: false,
    PUBLISHING: false,
    CUSTOM: false
  }
})

export default {
  name: 'AddEditIntegrationDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton,
    CharacterCountInput
  },

  mixins: [Request, AutoFocus, checkUniqueName, GetDataType, FileTypeMapper],

  props: {
    visible: Boolean,
    integrationType: String,
    integrationEdit: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  mounted: function() {
    this.fileTypes.unshift({
      value: '',
      label: '(No Filter)'
    })
  },
  data: function() {
    return {
      integration: defaultIntegration(),
      processStep: 1,
      rules: {
        displayName: [
          { required: true, validator: this.validateName, trigger: 'false' }
        ],
        integrationType: [
          { required: true, validator: this.validateType, trigger: 'false' }
        ],
        name: [
          { required: true, validator: this.validateName, trigger: 'false' }
        ],
        dataType: [
          { required: true, message: 'Please select a type', trigger: 'false' }
        ],
        // apiUrl: [
        //   { required: false, validator: this.validateApiUrl, trigger: 'false' }
        // ],
        customTargets: [
          {
            required: true,
            validator: this.validateCustomTargets,
            trigger: 'false'
          }
        ]
      },
      subscriptionKeys: [
        'metadata',
        'status',
        'models',
        'files',
        'permissions',
        'publishing'
      ],
      typeItems: [
        {
          value: 'viewer',
          label: 'Viewer'
        },
        {
          value: 'manager',
          label: 'Manager'
        }
      ],
      customTargets: [
        {
          value: 'DATASET',
          label: 'Dataset'
        },
        {
          value: 'PACKAGE',
          label: 'File'
        },
        {
          value: 'PACKAGES',
          label: 'Files'
        }
      ]
    }
  },

  computed: {
    ...mapState([
      'userToken',
      'config',
      'concepts',
      'dataset',
      'scientificUnits'
    ]),
    showSecret: function() {
      return Boolean(this.integration.secret)
    },
    /**
     * Computes create property CTA
     * @returns {String}
     */
    createText: function() {
      let createText = 'Add Integration'
      if (this.editingIntegration) {
        createText = 'Update Integration'
      }

      return this.processStep > 2 ? createText : 'Continue'
    },

    stepBackText: function() {
      return this.processStep > 1 ? 'Back' : 'Cancel'
    },

    /**
     * Convert display name into snake case
     * @returns {String}
     */
    name: function() {
      // Do not mutate if the user is editing a property
      if (this.editingIntegration) {
        return this.integration.name
      }

      return snakeCase(this.integration.displayName)
    },
    /**
     * Compute if user is editing an integration
     * @returns {Boolean}
     */
    editingIntegration: function() {
      return Boolean(Object.keys(this.integrationEdit).length)
    },

    /**
     * Compute dialog title based on if the user is editing a property
     * @returns {String}
     */
    dialogTitle: function() {
      return this.editingIntegration ? 'Update Integration' : 'Add Integration'
    }
  },

  watch: {
    /**
     * Watch name and set form model to the value
     * @param {String} val
     */
    name: function(val) {
      this.integration.name = val
    }
  },

  methods: {
    showFilter: function(target) {
      return target === 'PACKAGE' || target === 'PACKAGES'
    },
    generateSecret: function() {
      this.integration.secret = this.generateId(16)
    },
    /**
     * Handle enum list updates
     * @param {Array} list
     */
    handleEnumListUpdated: function(list) {
      this.savedEnumList = list.sort()
    },
    /**
     * Determines if tab content is active
     * @param {String} key
     * @param {String} type
     * @returns {Boolean}
     */
    shouldShow: function(key, type) {
      return (
        this.processStep === key &&
        (this.integrationType === type || type === 'All')
      )
    },

    /**
     * Handles open event
     */
    onOpen: function() {
      if (this.editingIntegration) {
        // set properties in local state to be referenced in createIntegration fn
        const ei = this.integrationEdit
        this.integration.displayName = ei.displayName
        this.integration.apiUrl = ei.apiUrl
        this.integration.name = ei.name
        this.integration.id = ei.id
        this.integration.description = ei.description
        this.integration.secret = ei.secret
        this.integration.isDefault = ei.isDefault
        this.integration.isDisabled = ei.isDisabled
        this.integration.isPrivate = ei.isPrivate
        this.integration.integrationType = ei.hasAccess ? 'manager' : 'viewer'
        for (let target in ei.eventTargets) {
          this.integration.eventTypeList[ei.eventTargets[target]] = true
        }
      } else {
        this.integration.secret = this.generateId(16)
      }

      this.autoFocus()
    },
    addCustomTarget: function() {
      this.integration.customTargets.push({ target: 'Dataset', filter: '' })
    },
    removeCustomTarget: function(index) {
      this.integration.customTargets.splice(index, 1)
    },

    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.$emit('update:visible', false)

      // delays the reset for the state
      setTimeout(() => {
        this.processStep = 1
        this.integration = defaultIntegration()
        this.$refs.integrationFormStep1.resetFields()
        this.$refs.integrationFormStep2.resetFields()
        this.$refs.integrationFormStep3a.resetFields()
        this.$refs.integrationFormStep3b.resetFields()
        this.$emit('update:integrationEdit', {})
      }, 500)
    },

    advanceStep: function(step) {
      this.processStep += step
      if (this.processStep === 0) {
        this.closeDialog()
      }

      if (this.processStep === 4) {
        this.createIntegration()
      }
    },

    /**
     * Send integration to API to create it
     */
    createIntegration: function() {
      let isValid = true
      this.$refs.integrationFormStep1.validate(valid => {
        if (!valid) {
          // switch tab views
          isValid = false
          return (this.processStep = 1)
        }
      })

      this.$refs.integrationFormStep2.validate(valid => {
        if (!valid) {
          // switch tab views
          isValid = false
          return (this.processStep = 2)
        }
      })

      this.$refs.integrationFormStep3a.validate(valid => {
        if (!valid) {
          // switch tab views
          isValid = false
          return (this.processStep = 3)
        }
      })

      this.$refs.integrationFormStep3b.validate(valid => {
        if (!valid) {
          // switch tab views
          isValid = false
          return (this.processStep = 3)
        }
      })

      if (isValid) {
        if (this.editingIntegration) {
          this.$emit('edit-integration', this.integration)
        } else {
          this.$emit('add-integration', this.integration)
        }
        this.closeDialog()
      }
    },
    validURL: function(str) {
      var pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$',
        'i'
      ) // fragment locator
      return !!pattern.test(str)
    },

    /**
     * Validate name
     * @param {Object} rule
     * @param {String} value
     * @param {Function} callback
     */
    validateName: function(rule, value, callback) {
      const displayNameMsg =
        rule.field === 'displayName' ? 'display name' : 'name'
      if (value === '') {
        callback(new Error(`Please provide a unique ${displayNameMsg}`))
      }
      callback()
    },
    validateType: function(rule, value, callback) {
      if (value === '') {
        callback(
          new Error(
            'Please select either "Viewer" or "Manager" as the integration type.'
          )
        )
      }
      callback()
    },
    validateDescription: function(rule, value, callback) {
      if (value === '' || value.length < 20) {
        callback(
          new Error(`Please provide a short description (>50 characters)`)
        )
      }
      callback()
    },
    validateApiUrl: function(rule, value, callback) {
      if (!this.validURL(value)) {
        callback(new Error(`Please provide a valid API url`))
      }
      callback()
    },
    validateCustomTargets: function(rule, value, callback) {
      // Check unique rows
      const uniques = new Set(value.map(item => item.target + item.filter))
      if ([...uniques].length !== value.length) {
        callback(new Error(`Please remove duplicate entries`))
      }
      callback()
    },
    dec2hex: function(dec) {
      return dec.toString(16).padStart(2, '0')
    },
    // generateId :: Integer -> String
    generateId: function(len) {
      const arr = new Uint8Array((len || 40) / 2)
      window.crypto.getRandomValues(arr)
      return Array.from(arr, this.dec2hex).join('')
    }
  }
}
</script>

<style lang="scss">
@import '../../assets/_variables.scss';

.add-integration-dialog {
  .el-form-item {
    .el-form-item__label {
      font-weight: 500;
      color: $gray_5;
    }
  }

  .el-select {
    &.input-property {
      width: 100%;

      &.target {
        max-width: 200px;
        margin-right: 8px;
      }

      &.filter {
        margin-right: 8px;
      }
    }
  }

  .item-field {
    margin-bottom: 24px;
    &.has-enums {
      margin-bottom: 14px;
    }
  }

  .el-checkbox {
    &.input-property {
      width: 100%;
    }
  }

  .check-description {
    margin-left: 25px;
    line-height: 1em;
  }
  .el-checkbox__inner {
    border: 1px solid $gray_5;
  }

  .el-checkbox__label,
  .el-form-item__label {
    color: $gray_6;
    font-weight: 400;
  }

  .targetOptions {
    flex-direction: row;
    display: flex;
    margin: 8px 0;
  }

  .disabled-label {
    color: #c0c4cc;
    cursor: not-allowed;
    margin-top: 10px;
  }

  .label {
    margin-top: 10px;
  }

  /deep/ .el-select-group,
  .el-select-dropdown__item {
    padding-bottom: 10px;
  }
  .item-checkbox .el-form-item__content {
    line-height: 1em;
  }
  #item-concept-title {
    #current-name {
      margin-left: 24px;
    }
  }
  .info {
    font-size: 12px;
    color: $gray_4;
  }
  .info {
    font-size: 12px;
    color: $gray_4;
    &.disabled-label {
      color: #c0c4cc;
      cursor: not-allowed;
      margin-top: -18px;
      height: 26px;
      margin-left: 25px;
    }
  }
  .el-form-item {
    .el-form-item__label {
      text-align: left;
    }
  }
  .el-dialog {
    height: auto;
    width: 524px;
  }
  .el-dialog__footer {
    width: 100%;
  }
  .string-sub-type {
    display: flex;
    flex-direction: row;
  }
}
</style>
