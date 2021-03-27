<template>
  <el-dialog
    :visible="visible"
    class="add-property-dialog"
    :show-close="false"
    @open="onOpen"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      :title="dialogTitle"
    >
      <ul
        slot="tabs"
        class="tabs unstyled"
      >
        <li
          v-for="tab in tabData"
          :key="tab.name"
          :item="tab"
        >
          <a
            href="#"
            :class="tabClass(tab.active, tab.name)"
            @click.prevent="tabClicked(tab.name)"
          >
            {{ tab.name }}
          </a>
        </li>
      </ul>
    </bf-dialog-header>

    <dialog-body>
      <!-- Overview -->
      <el-form
        v-show="shouldShow('Overview')"
        ref="propertyForm"
        :model="property"
        :rules="rules"
        @submit.native.prevent="createProperty"
      >
        <el-form-item prop="displayName">
          <template slot="label">
            Display Name <span class="label-helper">
              required
            </span>
          </template>
          <el-input
            v-model="property.displayName"
            placeholder="For example Protocol, Type, Species"
            autofocus
          />
        </el-form-item>

        <el-form-item prop="name">
          <template slot="label">
            Property Identifier <span class="label-helper">
              generated from name
            </span>
          </template>
          <el-input
            v-model="property.name"
            :disabled="editingProperty"
          />
        </el-form-item>

        <el-form-item prop="dataType">
          <template slot="label">
            Type <span class="label-helper">
              required
            </span>
          </template>
          <el-select
            v-model="property.dataType"
            :disabled="editingProperty"
            @change="savedEnumList = []"
          >
            <el-option
              label="Text"
              value="String"
            />
            <el-option
              label="Boolean"
              value="Boolean"
            />
            <el-option
              label="Date"
              value="Date"
            />
            <el-option
              label="Number"
              value="Long"
            />
            <el-option
              label="Decimal"
              value="Double"
            />
            <el-option
              label="Model"
              value="Model"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="isDataTypeModel"
          prop="model"
        >
          <template slot="label">
            Model <span class="label-helper">
              required
            </span>
          </template>
          <el-select
            v-model="property.to"
            :disabled="editingProperty"
          >
            <el-option
              v-for="concept in concepts"
              :key="concept.id"
              :label="concept.displayName"
              :value="concept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          class="item-checkbox"
          prop="required"
        >
          <el-checkbox
            v-model="property.required"
            :disabled="editingProperty || isConceptTitle || isDataTypeModel"
            label="This is a required property"
          />
        </el-form-item>
      </el-form>

      <!-- Configure -->
      <div
        v-show="shouldShow('Configure')"
      >
        <el-form
          ref="propertyFormConfigure"
        >
          <el-form-item
            id="item-concept-title"
            class="item-checkbox"
            prop="conceptTitle"
          >
            <el-checkbox
              v-model="property.conceptTitle"
              :disabled="disableConceptTitle"
              label="Use this property as the Model Title"
            /> <a
              href="http://help.blackfynn.com/blackfynn-web-application/blackfynn-knowledge-graph/creating-blackfynn-data-models"
              class="label-helper"
              target="_blank"
            >
              What's this?
            </a>
            <div
              v-if="conceptTitleName"
              id="current-name"
            >
              <strong>{{ conceptTitleName }}</strong> is currently being used.
            </div>
            <div
              v-if="!conceptTitleName"
              id="current-name"
            >
              A title is required to save properties.
            </div>
          </el-form-item>

          <el-form-item
            class="item-checkbox"
            prop="allowMultiValues"
          >
            <el-checkbox
              v-model="property.isMultiValue"
              :disabled="editingProperty || invalidMultiValueType"
              label="Allow multiple values"
            />
          </el-form-item>

          <el-form-item
            class="item-checkbox has-enums"
            prop="enum"
          >
            <el-checkbox
              v-model="property.isEnum"
              :disabled="editingProperty || invalidEnumType || applyStringSubtype"
              label="Accept only specific values"
            />
            <div class="info">
              Users will be able to select multiple values from the list you create.
            </div>
          </el-form-item>
          <el-form-item v-if="property.dataType === 'Long' || property.dataType === 'Double'">
            <el-checkbox
              v-model="scientificUnitCheckbox"
              label="Apply a Scientific Unit to this property"
            />
            <p :class="scientificUnitCheckbox ? 'info scientific-label' : 'info disabled-label'">
              Updating the Scientific Unit will not convert data values
            </p>
            <el-select
              v-model="scientificValue"
              placeholder="Select a Unit"
              class="item-dropdown scientific-unit"
              placement="bottom"
              :disabled="!scientificUnitCheckbox"
            >
              <el-option-group
                v-for="group in scientificUnits"
                :key="group.dimension"
                :label="group.dimension"
                class="dropdown-group__title"
              >
                <el-option
                  v-for="item in group.units"
                  :key="item.name"
                  :label="item.description"
                  :value="item.displayName"
                />
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="scientificValue === 'Other'"
            class="item-dropdown scientific-unit"
            prop="placeholderValue"
          >
            <template slot="label">
              <div :class="scientificUnitCheckbox ? 'label' : 'disabled-label'">
                If other, specify:
              </div>
            </template>
            <el-input
              v-model="placeholderUnit"
              :disabled="!scientificUnitCheckbox"
              placeholder="Enter a unit—e.g., min"
            />
          </el-form-item>
          <div v-if="property.dataType === 'String'">
            <el-form-item
              class="mb-0"
              prop="applyStringSubtype"
            >
              <el-checkbox
                v-model="applyStringSubtype"
                :disabled="editingProperty || property.isEnum"
                label="Apply a string type to this property"
              />
            </el-form-item>
            <p class="info">
              Values will be checked against the displayed regular expression
            </p>
            <div class="string-sub-type">
              <el-form-item
                class="item-dropdown mr-16"
                prop="textSubTypeValue"
              >
                <el-select
                  v-model="stringSubtypeValue"
                  placeholder="Select"
                  placement="bottom"
                  :disabled="editingProperty || !applyStringSubtype"
                >
                  <el-option
                    v-for="item in stringSubtypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-input
                disabled
                :value="stringSubtypeRegex"
              />
            </div>
          </div>
          <enum-list
            v-if="property.isEnum && !invalidEnumType"
            ref="enumList"
            :disabled="editingProperty"
            :saved-list="savedEnumList"
            :property="property"
            @enum-list-updated="handleEnumListUpdated"
          />
        </el-form>
      </div>
    </dialog-body>

    <!-- Overview buttons -->
    <div
      v-show="shouldShow('Overview')"
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button @click="createProperty">
        {{ createText }}
      </bf-button>
      <button
        class="configure-property-btn"
        :disabled="isDataTypeModel"
        @click="tabClicked('Configure')"
      >
        {{ configureText }}
      </button>
    </div>

    <!-- Configure buttons -->
    <div
      v-show="shouldShow('Configure')"
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button @click="createProperty">
        Save
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
  import snakeCase from 'lodash.snakecase'
  import {mapState} from 'vuex'
  import {clone, compose, defaultTo, head, path, pathEq, pathOr, propOr} from 'ramda'

  import EnumList from '../../../shared/EnumList/EnumList.vue'
  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
  import Request from '../../../../mixins/request'
  import GetDataType from '../../../../mixins/data-type'
  import AutoFocus from '../../../../mixins/auto-focus'
  import checkUniqueName from '../../../../mixins/check-unique-names'

  /**
   * Returns the default values for a property
   * @returns {Object}
   */
  const defaultProperty = () => (
    {
      displayName: '',
      name: '',
      dataType: '',
      conceptTitle: false,
      default: false,
      required: false,
      isEnum: false,
      isMultiValue: false
    }
  )

  export default {
    name: 'AddEditPropertyDialog',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton,
      EnumList,
    },

    mixins: [
      Request,
      AutoFocus,
      checkUniqueName,
      GetDataType,
    ],

    props: {
      selectedFiles: {
        type: Array,
        default: () => []
      },
      visible: Boolean,
      conceptTitleName: {
        type: String,
        default: ''
      },
      properties: {
        type: Array,
        default: () => []
      },
      propertyEdit: {
        type: Object,
        default: function(){
          return {}
        }
      },
      model: {
        type: Object,
        default: function() {
          return {}
        }
      },
      stringSubtypes: {
        type: Array,
        default: () => []
      }
    },

    data: function() {
      return {
        property: defaultProperty(),
        rules: {
          displayName: [
            { required: true, validator: this.validateName, trigger: 'false' },
          ],
          name: [
            { required: true, validator: this.validateName, trigger: 'false' },
          ],
          dataType: [
            { required: true, message: 'Please select a type', trigger: 'false' }
          ]
        },
        tabData: [
          {
            name: 'Overview',
            active: true
          },
          {
            name: 'Configure',
            active: false
          }
        ],
        savedEnumList: [],
        isDataTypeModel: false,
        scientificValue: '',
        placeholderUnit: '',
        scientificUnitCheckbox: false,
        applyStringSubtype: false,
        stringSubtypeValue: '',
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

      /**
       * Determines if data type is invalid for multi values
       * @returns {Boolean}
       */
      invalidMultiValueType: function() {
        const dataType = this.getRawDataType(this.property)
        return dataType === 'Boolean' || this.isConceptTitle
      },

      /**
       * Determines if data type is invalid for enums
       * @returns {Boolean}
       */
      invalidEnumType: function() {
        const dataType = this.getRawDataType(this.property)
        return dataType === 'Date' || dataType === 'Boolean'
      },

      /**
       * Computes configure property CTA
       * @returns {String}
       */
      configureText: function() {
        return this.editingProperty ? 'Save and Configure' : 'Create and Configure'
      },

      /**
       * Computes create property CTA
       * @returns {String}
       */
      createText: function() {
        return this.editingProperty ? 'Save Property' : 'Create Property'
      },

      /**
       * Convert display name into snake case
       * @returns {String}
       */
      name: function() {
        // Do not mutate if the user is editing a property
        if (this.editingProperty) {
          return this.property.name
        }

        return snakeCase(this.property.displayName)
      },

      /**
       * Compute if user is editing a property
       * @returns {Boolean}
       */
      editingProperty: function() {
        return Boolean(Object.keys(this.propertyEdit).length)
      },

      /**
       * Compute dialog title based on if the user is editing a property
       * @returns {String}
       */
      dialogTitle: function() {
        return this.editingProperty ? 'Update Property' : 'New Property'
      },

      /**
       * Compute the active model's record count
       * @returns {Number}
       */
      recordCount: function() {
        return propOr(0, 'count', this.model)
      },

      /**
       * Compute the concept title
       * @returns {Boolean}
       */
      isConceptTitle: function() {
        return propOr(false, 'conceptTitle', this.property)
      },

      /**
       * Computes if model title should be disabled
       * @returns {Boolean}
       */
      disableConceptTitle: function() {
        return (this.conceptTitleName && this.conceptTitleName === this.property.name) || this.property.isMultiValue
      },

      /**
       * Compute if there is only one property and it's dataType is Model
       * @returns {Boolean}
       */
      hasLinkedPropertyOnly: function() {
        const dataType = propOr('', 'dataType', head(this.properties))
        return dataType === 'Model'
      },

      /**
       * gets the regex string to be placed int the readonly input next to the subtype
       */
      stringSubtypeRegex: function() {
        return (this.stringSubtypes
          .find(subtype => subtype.value === this.stringSubtypeValue
          ) || { regex: '' }).regex
      }
    },

    watch: {
      /**
       * Watch name and set form model to the value
       * @param {String} val
       */
      name: function(val) {
        this.property.name = val
      },
      /**
       * Watch invalidEnumType and reset property
       * @param {Boolean} val
       */
      invalidEnumType: function(val) {
        if (val) {
          this.property.isEnum = false
        }
      },
      /**
       * Watch concept title and ensure that it is required if set
       */
      isConceptTitle: function(isConceptTitle) {
        if (isConceptTitle) {
          this.property.required = true
          this.property.isMultiValue = false
        } else {
          this.property.required = false
        }
      },

      /**
       * Watch property dataType
       */
      'property.dataType': {
        handler: function(val) {
          if (val === 'Model') {
            this.isDataTypeModel = true
            this.rules.to = { required: true, message: 'Please select a model', trigger: 'false' }
            this.property.conceptTitle = false
            this.property.required = false
          } else {
            this.isDataTypeModel = false
            delete this.rules.to

            if (this.properties.length === 0) {
              this.property.conceptTitle = true
              this.property.required = true
            }
          }
        }
      }
    },

    methods: {

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
       * @returns {Boolean}
       */
      shouldShow: function(key) {
        const activeTab = this.tabData.filter(tab => tab.active)
        const activeTabName = pathOr('', [0, 'name'], activeTab)
        return activeTabName === key
      },
      /**
       * Returns tab class to track state
       * @param {Boolean} isActive
       * @param {String} tabName
       */
      tabClass: function(isActive, tabName) {
        if (tabName === 'Configure' && this.isDataTypeModel) {
          return 'disabled'
        }
        return isActive ? 'active' : ''
      },
      /**
       * Returns tab class to track state
       * @param {String} key
       */
      tabClicked: function(key) {
        if (key === 'Configure' && this.isDataTypeModel) {
          return
        }
        // update tab state
        this.tabData = this.tabData.map(tab => {
          tab.active = tab.name === key
          return tab
        })
      },
      /**
       * Handles open event
       */
      onOpen: function() {
        this.scientificValue = ''
        this.placeholderUnit = ''
        this.scientificUnitCheckbox = false
        this.stringSubtypeValue = ''
        this.applyStringSubtype = false
        // check the concept title box by default if no properties currently exist
        if (this.properties.length === 0 || this.hasLinkedPropertyOnly) {
          this.property.conceptTitle = true
          this.property.required = true
        }

        if (this.editingProperty) {
          // set properties in local state to be referenced in createPropety fn
          this.propertyEdit.isEnum = this.isEnum(this.propertyEdit)
          this.propertyEdit.isMultiValue = this.isMultiValue(this.propertyEdit)

          this.property = clone(this.propertyEdit)
          if (this.property.dataType.unit) {
           this.scientificUnitCheckbox = true
           this.checkCustomScientificUnits(this.property)
          }
          this.stringSubtypeValue =
            pathOr('', ['dataType', 'format'], this.property) ||
            pathOr('', ['dataType', 'items', 'format'], this.property)
          this.applyStringSubtype = !!this.stringSubtypeValue && this.stringSubtypeValue !== 'Date'
          this.property.dataType = this.getRawDataType(this.property)
        }

        this.savedEnumList = this.getEnums(this.propertyEdit).sort()
        this.autoFocus()
      },

      /**
       * Checks if unit value is a custom unit
       */
      checkCustomScientificUnits: function(property) {
        this.scientificUnits.forEach(group => {
          group.units.forEach(unit => {
            if (unit.name === property.dataType.unit) {
              // we found it!
              this.scientificValue = property.dataType.unit
            }
          })
        })
        if (this.scientificValue === '') {
          this.scientificValue = 'Other'
          this.placeholderUnit = this.property.dataType.unit
        }
      },

      /**
       * Returns list of enumerables
       * @param {Object}
       * @returns {Array}
       */
      getEnums: pathOr([], ['dataType', 'items', 'enum']),

      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.$emit('update:visible', false)

        // delays the reset for the tab state
        setTimeout(() => {
          this.tabData = this.tabData.map((tab, idx) => {
            tab.active = idx === 0 ? true : false
            return tab
        })
        this.property = defaultProperty()
        this.$refs.propertyForm.resetFields()
        this.$refs.propertyFormConfigure.resetFields()
        this.savedEnumList = []
        this.$emit('update:propertyEdit', {})
        }, 500)
      },

      /**
       * Send property to API to create it
       */
      createProperty: function() {
        this.$refs.propertyForm.validate((valid) => {
          if (!valid) {
            // switch tab views
            return this.tabClicked('Overview')
          }

          const props = {
            value: '',
            locked: false,
            description: ''
          }

          const property = Object.assign({}, this.property, props)
          // transform name
          property.name = snakeCase(property.name)
          // transform for data type to support complex types
          property.dataType = this.transformDataType(property)

          // remove model property, used only for form validation when creating linked property
          if (this.property.dataType !== 'Model') {
            delete property.model
          } else {
            // update linked property position if it's new
            if (!property.position) {
              property.position = this.properties.length
            }
          }

          if (this.editingProperty) {
            this.$emit('edit-property', property)
          } else {
            this.$emit('add-property', property)
          }
        })
      },

      /**
       * Validate name
       * @param {Object} rule
       * @param {String} value
       * @param {Function} callback
       */
      validateName: function(rule, value, callback) {
        const displayNameMsg = rule.field === 'displayName' ? 'display name' : 'name'
        if (value === '') {
          callback(new Error(`Please provide a unique ${displayNameMsg}`))
        }

        // Only check unique property if the user is adding a new property
        if (!this.editingProperty) {
          const isUnique = this.checkUniqueName(this.properties, [rule.field], value, '')
          if (!isUnique) {
            callback(new Error(`A property with this ${displayNameMsg} already exists`))
          }
        }
        callback()
      },

      /**
       * Computes whether property is an enumerable data type
       * @returns {Boolean}
       */
      isEnum: compose(
        Boolean,
        path(['dataType', 'items', 'enum']),
        defaultTo({})
      ),

      /**
       * Computes whether property is can have multiple values data type
       * @returns {Boolean}
       */
      isMultiValue: compose(
        pathEq(['dataType', 'type'], 'array'),
        defaultTo({})
      ),

      /**
       * Transforms dataType to support complex types if necessary
       * @returns {Object}
       */
      transformDataType: function() {
        const _isEnum = this.property.isEnum
        const _isMultiValue = this.property.isMultiValue
        const _dataType = this.property.dataType
        const _enumList = this.savedEnumList

        // check if dataType is a complex type
        if (_isEnum && _isMultiValue) {
          return {
            'type': 'array',
            'items': {
              'type': _dataType,
              'enum': this.transformEnumListValues(_enumList)
            }
          }
        } else if (_dataType === 'String' && this.applyStringSubtype && this.stringSubtypeValue) {
          if (_isMultiValue) {
            return {
              type: 'array',
              items: {
                type: _dataType,
                format: this.stringSubtypeValue
              }
            }
          }
          return {
            type: _dataType,
            format: this.stringSubtypeValue
          }
        } else if (_isEnum && !_isMultiValue) {
          return {
            'type': 'enum',
            'items': {
              'type': _dataType,
              'enum': this.transformEnumListValues(_enumList)
            }
          }
        } else if (_dataType === 'Long' || _dataType === 'Double') {
            if (_isMultiValue) {
              return {
              'type': 'array',
              'items': {
                'type': _dataType,
                'unit': this.transformScientificUnit()
              }
            }
            }
            return {
              'type': _dataType,
              'unit': this.transformScientificUnit()
            }
          }
        else if (!_isEnum && _isMultiValue) {
          return {
            'type': 'array',
            'items': {
              'type': _dataType,
            }
          }
        }

        // if dataType is not a complex type, just return it
        return _dataType
      },

      /**
       * Retrieves the scientific value that will actually be stored
       * in the database for the endpoint call
       * @returns {String}
       */
      transformScientificUnit: function() {
        let transformedUnit = ''
        this.scientificUnits.forEach(unit => {
          const unitItems = unit.units
          unitItems.forEach(item => {
            if (this.scientificValue === 'Other') {
              transformedUnit = this.placeholderUnit
            } else if (item.displayName === this.scientificValue && this.scientificUnitCheckbox) {
              transformedUnit = item.name
            }
          })
        })
        return transformedUnit
      },
      /**
       * Transforms enumerated list of values
       * @param {Array}
       * @returns {Array}
       */
      transformEnumListValues: function(list) {
        return list.map(val => {
          const dataType = this.getRawDataType(this.property)
          return dataType === 'Long' || dataType === 'Double' ? Number(val) : val
        })
      },
    }
  }
</script>

<style lang="scss">
  @import '../../../../assets/_variables.scss';

  .add-property-dialog {
    .el-select {
      width: 100%;
    }
    .item-checkbox {
      margin-bottom: 24px;
      &.has-enums {
        margin-bottom: 14px;
      }
    }
    .el-checkbox__label, .el-form-item__label {
      color: $dark-gray;
      font-weight: 400;
    }

    .disabled-label {
      color: #C0C4CC;
      cursor: not-allowed;
      margin-top: 10px;
    }

    .label {
      margin-top: 10px;
    }

    .scientific-unit {
      margin-top: -17px;
      margin-left: 24px;
      &.el-select {
        margin-bottom: 10px;
        width: 434px;

      }
    }

    /deep/ .el-select-group, .el-select-dropdown__item {
        padding-bottom: 10px;
      }
    .item-checkbox .el-form-item__content {
      line-height: inherit;
    }
    #item-concept-title {
      #current-name {
        margin-left: 24px;
      }
    }
    .info {
      font-size: 12px;
      color: $glial;
    }
    .info {
      font-size: 12px;
      color: $glial;
      &.scientific-label {
        margin-top: -18px;
        height: 26px;
        margin-left: 25px;
      }
      &.disabled-label {
        color: #C0C4CC;
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
    .configure-property-btn {
      color: $dopamine;
      font-size: 14px;
      margin-left: 24px;
      &:not([disabled]) {
        &:hover() {
          color: #000;
        }
      }
      &[disabled] {
        opacity: .6;
        cursor: not-allowed;
      }
    }
    .tabs a.disabled {
      cursor: not-allowed !important;
    }
    .string-sub-type {
      display: flex;
      flex-direction: row;
    }
  }
</style>

