<template>
  <div :class="classNames">
    <div class="concept-instance-property-input">
      <!-- multi-value enumerable -->
      <template v-if="isMultiValueEnum">
        <el-select
          v-for="value in property.value"
          :id="`input-${value}`"
          ref="enum"
          :key="value"
          v-model="property.value"
          class="input-property"
          :disabled="property.locked"
          filterable
          :default-first-option="true"
          @change="validateInput"
          @focus="onSelectFocus('enum')"
        >
          <el-option
            v-for="item in enumItems"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <el-select
          v-if="!property.value"
          ref="enum"
          v-model="property.value"
          class="input-property"
          :disabled="property.locked"
          filterable
          :default-first-option="true"
          @focus="onSelectFocus('enum')"
          @change="validateInput"
        >
          <el-option
            v-for="item in enumItems"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </template>

      <!-- enumberable -->
      <template v-else-if="isEnum">
        <el-select
          :id="`input-${property.name}`"
          ref="enum"
          v-model="property.value"
          class="input-property"
          :disabled="property.locked"
          filterable
          :default-first-option="true"
          @focus="onSelectFocus('enum')"
          @change="validateInput"
        >
          <el-option
            v-for="item in enumItems"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </template>

      <!-- all other data types -->
      <template v-else>
        <el-input
          v-if="validateType('String') && property.locked === false"
          :id="`input-${property.name}`"
          ref="text"
          v-model="property.value"
          class="input-property"
          :type="textType"
          :rows="1"
          :placeholder="placeholder"
          autosize
          @blur="validateInput"
        />
        <div class="unit-property">
          <div class="col-type-property">
            <el-input
              v-if="validateType('Double') || validateType('Long') && property.locked === false"
              :id="`input-${property.name}`"
              ref="text"
              v-model="property.value"
              class="input-property"
              :controls="false"
              type="number"
              :placeholder="placeholder"
              @blur="validateInput"
            />
          </div>
          <div class="col-unit-property">
            <span>
              {{ getDataTypeProperty(property) }}
            </span>
          </div>
        </div>
        <div
          v-if="!validateType('Date') && !validateType('Boolean') && property.locked === true"
          class="input-property text-disabled"
        >
          <div class="value">
            {{ inputValue }}
          </div>
          <svg-icon
            name="icon-lock-filled"
            height="20"
            width="20"
            color="#DADADA"
          />
        </div>

        <el-select
          v-if="validateType('Boolean')"
          :id="`input-${property.name}`"
          ref="boolean"
          v-model="property.value"
          class="input-property"
          :disabled="property.locked"
          :default-first-option="true"
          @focus="onSelectFocus('boolean')"
          @change="validateInput"
        >
          <el-option
            :label="placeholder || 'No Value'"
            :value="null"
          />
          <el-option
            label="True"
            :value="true"
          />
          <el-option
            label="False"
            :value="false"
          />
        </el-select>

        <el-date-picker
          v-if="validateType('Date')"
          :id="`input-${property.name}`"
          v-model="property.value"
          class="input-property"
          :disabled="property.locked"
          format="M/d/yyyy HH:mm:ss"
          value-format="yyyy-MM-ddTHH:mm:ss"
          type="datetime"
          :placeholder="placeholder || 'Enter a date: MM/DD/YYYY'"
          autofocus
          @blur="validateInput"
        />
      </template>
      <!-- displays error message per input -->
      <transition name="el-zoom-in-top">
        <div
          v-if="error"
          class="el-form-item__error"
        >
          {{ errorMessage }}
        </div>
      </transition>
    </div><!-- /.concept-instance-property-input -->

    <!-- button to remove multi values inputs -->
    <button
      v-if="hasMultiValues && property.arrayIndex && !property.locked"
      :class="!getDataTypeProperty(property) ? 'icon-remove-button' : 'icon-remove-button-unit'"
      @click="removeMultiValue"
    >
      <svg-icon
        name="icon-remove"
        width="10"
        height="10"
        color="#71747C"
      />
    </button>
  </div>
</template>

<script>
  import AsyncValidator from 'async-validator'
  import { propOr, toLower, pathOr } from 'ramda'
  import AutoFocus from '../../../../mixins/auto-focus'
  import DataType from '../../../../mixins/data-type'
  import EventBus from '../../../../utils/event-bus'
  import { hasStringSubtype, hasUnit } from '../../../../mixins/data-type/utils'


  export default {
    name: 'ConceptInstancePropertyInput',

    mixins: [
      AutoFocus,
      DataType
    ],

    props: {
      property: {
        type: Object,
        default: function() {
          return {
            name: '',
            displayName: '',
            value: '',
            locked: false,
            dataType: 'String',
            required: false
          }
        }
      },
      textType: {
        type: String,
        default: 'textarea'
      },
      placeholder: {
        type: String,
        default: ''
      },
      required: {
        type: Boolean,
        default: false
      },
      hasMultiValues: {
        type: Boolean,
        default: false
      },
      isEnum: {
        type: Boolean,
        default: false
      },
      stringSubtypes: {
        type: Array,
        default: () => []
      }
    },

    data: function() {
      return {
        inputValue: undefined,
        shouldOpen: true,
        error: false,
      }
    },

    computed: {
      /**
       * Compute whether property is a multi-value enum
       * @returns {Boolean}
       */
      isMultiValueEnum: function() {
        const value = propOr('', 'value', this.property)
        return this.isEnum && this.hasMultiValues && Array.isArray(value)
      },

      /**
       * Compute enumerable items to be displayed in a select menu
       * @returns {Array}
       */
      enumItems: function() {
        return pathOr([], ['dataType', 'items', 'enum'], this.property).sort()
      },

      /**
       * Compute if the property has changed in edit mode
       * @returns {Boolean}
       */
      hasChanged: function() {
        return propOr('', 'value', this.property) !== this.inputValue
      },

      /**
       * Compute error message based on type
       */
      errorMessage: function() {
        let type = toLower(this.getRawDataType(this.property))

        if (type === 'long') {
          type = 'numerical'
        }

        const stringSubtype = hasStringSubtype(this.property);
        if (hasStringSubtype) {
          const subType = this.stringSubtypes.find(s => s.value === stringSubtype)
          if (subType) type = subType.label
        }

        return `Please provide data in ${type} format`
      },

      /**
       * Computes classnames for component
       */
      classNames: function() {
        const base = 'concept-instance-property-input-wrapper'
        const multiValue = this.property.arrayIndex ? ' is-multi-value' : ''
        return base + multiValue
      },
    },

    watch: {
      /**
       * Watch hasChanged and emit event
       * @param {Boolean} val
       */
      hasChanged: function(val) {
        EventBus.$emit('instance-value-changed', {
          changed: val,
          name: propOr('', 'name', this.property)
        })
      },

      /**
       * Watch error and emit event
       * @param {Boolean} val
       */
      error: function(val) {
        EventBus.$emit('instance-value-error', {
          error: val,
          name: propOr('', 'name', this.property)
        })
      }
    },

    mounted: function() {
      this.inputValue = propOr('', 'value', this.property)

      // Disable shouldOpen to preserve normal select functionality
      this.$nextTick(function() {
        this.shouldOpen = false
      })
    },

    methods: {

      /**
       * Gets the specific datatype based on property type
       */
      getDataTypeProperty: function(property) {
        return hasUnit(property) !== false ? hasUnit(property) : ''
      },

      /**
       * Focus event for select
       * Open the dropdown if shouldOpen
       */
      onSelectFocus: function(refName) {
        if (this.shouldOpen && this.$refs[refName]) {
          this.$refs[refName].visible = true
        }
      },

      /**
       * Validate data type
       * @param {String} dType
       * @returns {Boolean}
       */
      validateType: function(dType) {
        return this.getRawDataType(this.property) === dType
      },

      /**
       * Validate input
       */
      validateInput: function() {
        let type = toLower(this.getRawDataType(this.property))
        let pattern = '.*'

        switch (type) {
          case 'long':
            pattern = /^\d+$/
            break;

          case 'double':
            pattern = /^(?=.)([+-]?([0-9]*)(\.([0-9]+))?)$/
            break;

          case 'string':
            // eslint-disable-next-line no-case-declarations
            const stringSubtype = hasStringSubtype(this.property)
            if (stringSubtype) {
              const subType = this.stringSubtypes.find(s => s.value === stringSubtype)
              if (subType) pattern = subType.regex
            }
            break;

          default:
            pattern = '.*'
            break;
        }

        const descriptor = this.getDescriptor(pattern, type)

        const validator = new AsyncValidator(descriptor)
        const propertyValue = propOr('', 'value', this.property)

        validator.validate({value: propertyValue}, (errors) => {
          if (this.required && (propertyValue === null || propertyValue === undefined)) {
            this.error = true
            return
          }
          this.error = errors ? true : false
        })
      },

      /**
       * Get descriptor for validation based off of pattern and type
       * @param {String} pattern
       * @param {String} type
       * @returns {Object}
       */
      getDescriptor: function(pattern, type) {
        const isConceptTitle = propOr(false, 'conceptTitle', this.property)
        const requiredField = propOr(false, 'required', this.property)
        const required = requiredField || isConceptTitle

        let descriptor = {
          value: {
            pattern,
            required
          }
        }

        if (type === 'boolean') {
          if (this.property.value === undefined) {
            descriptor = {
              value: {
                required
              }
            }
          } else {
            descriptor = {
              value: {
                required,
                type: 'boolean'
              }
            }
          }
        }

        return descriptor
      },
      /**
       * Removes instance of multi value by index
       */
      removeMultiValue: function() {
        const idx = propOr(-1, 'arrayIndex', this.property)
        this.$emit('remove-multi-value-by-index', idx)
        // remove instance of error
        EventBus.$emit('instance-value-error', {
          name: propOr('', 'name', this.property)
        })
      },
    }
  }

</script>

<style lang="scss">
  @import '../../../../assets/_variables.scss';

  .concept-instance-property-input-wrapper {
    position: relative;
    max-width: 476px;

    &.is-multi-value {
      margin-top: 16px;
    }
    .concept-instance-property-input {
      .text-disabled {
        box-sizing: border-box;
        padding-right: 48px;
        position: relative;
        .svg-icon {
          right: 20px;
          position: absolute;
          top: 10px;
        }
      }
      .input-property {
        width: 100%;
        input::-webkit-inner-spin-button {
          display: none;
        }
      }

      .unit-property {
        display: -webkit-box;
        align-items: center;
      }

      .col-type-property {
        width: 100%;
      }
      .col-unit-property {
        position: relative;
        left: 10px;
        color: $glial;
      }
      .el-input-number .el-input__inner {
        text-align: left;
      }

    }
    .icon-remove-button {
      position: absolute;
      right: -22px;
      top: 13px;
    }

    .icon-remove-button-unit {
      position: absolute;
      right: -47px;
      top: 13px;
    }
  }
</style>
