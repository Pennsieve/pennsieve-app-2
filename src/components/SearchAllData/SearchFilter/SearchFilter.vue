<template>
  <div
    class="search-filter"
    :class="{ 'is-invalid': isInvalid }"
  >
    <div class="search-filter-content">
      <div
        ref="inputWrap"
        class="search-filter-wrap mr-16"
        :class="{ 'disabled': disabled }"
      >
        <svg-icon
          class="mr-8"
          icon="icon-filter-filled"
          height="16"
          width="16"
        />
        <div class="search-filter-criteria-wrap">
          <span
            v-if="isPlaceholderVisible"
            class="placeholder"
          >
            Patient age is greater than 32
          </span>

          <search-filter-criteria
            v-if="showDatasetLabel"
            class="filter-criteria"
            :class="{ 'no-flex': filter.type === 'dataset' }"
            :criteria="filter.datasetId"
            :label="filter.datasetName"
            :disabled="true"
            :locked="true"
          />

          <search-filter-criteria
            ref="criteriaTarget"
            v-model="targetInput"
            class="filter-criteria"
            :class="{ 'no-flex': filter.type === 'dataset' }"
            :criteria="filter.target"
            :label="filter.targetLabel"
            :options="targets"
            :loading="isLoadingTargets"
            :disabled="disabled"
            :locked="lockTarget"
            @select="setTargetFilter"
          />

          <search-filter-criteria
            v-if="filter.target && filter.type === 'model'"
            ref="criteriaProperty"
            class="filter-criteria"
            option-key="id"
            :criteria="filter.property"
            :label="filter.propertyLabel"
            :option-prefix="filter.targetLabel"
            :options="properties"
            :loading="isLoadingProperties"
            :disabled="disabled"
            @select="setPropertyFilter"
            @delete="onDeleteProperty"
          />

          <search-filter-criteria
            v-if="filter.property"
            ref="criteriaOperations"
            class="filter-criteria"
            :criteria="filter.operation"
            :label="filter.operationLabel"
            :option-prefix="`${filter.targetLabel} ${filter.propertyLabel}`"
            :options="operations"
            :loading="isLoadingProperties"
            :disabled="disabled"
            @select="setOperationFilter"
            @delete="onDeleteOperation"
          />

          <div
            class="filter-criteria value">
            <search-filter-input
              v-if="filter.operation"
              ref="filterInput"
              v-model="filter.value"
              :property-type="filter.propertyType"
              :value-suggestions="valueSuggestions"
              :loading="isLoadingValueSuggestions"
              @delete="onDeleteFilterValue"
              @keyup.native.enter="$emit('enter')"
              @input="onFilterInput"
              @focus="getValueSuggestions"
            />
            <div
              v-if="filter.operation"
            >
              {{ propertyHasUnit(filter.propertyType) }}
            </div>

          </div>

        </div>
      </div>
      <button
        class="btn-delete"
        @click="$emit('delete')"
      >
        <svg-icon
          icon="icon-trash"
          height="20"
          width="20"
        />
      </button>
    </div>

    <p
      v-if="isInvalid"
      class="msg-invalid mt-8"
    >
      Incomplete filter will not be applied.
    </p>
  </div>
</template>

<script>
import {
  compose,
  defaultTo,
  find,
  filter,
  head,
  last,
  merge,
  pathEq,
  pathOr,
  propEq,
  propOr,
  reject,
  uniq
} from 'ramda'
import {
  mapState
} from 'vuex'
import debounce from 'lodash/debounce'

import SearchFilterCriteria from '../SearchFilterCriteria/SearchFilterCriteria.vue'
import SearchFilterInput from '../SearchFilterInput/SearchFilterInput.vue'

import Request from '@/mixins/request'
import { getUnitDisplayName } from '@/mixins/data-type/utils'

/**
 * Transform properties to add a `label` and `value` object
 * @param {Array} properties
 * @returns {Array}
 */
const transformProperties = (properties) => properties.map(property => {
  const label = propOr('', 'displayName', property)
  const value = propOr('', 'name', property)
  /*
   * @TODO Optimize this code because it doesn't seem like
   * looping through the list again is the best way
   */
  const totalProps = filter(propEq('name', value), properties)

  property.label = label
  property.value = value
  if (totalProps.length > 1) {
    property.isDuplicateName = true
  }
  return property
})

/**
 * Operator map to transform a machine readable operator
 * to a human readable string
 */
const operatorMap = {
  '=': 'equals',
  '<>': 'does not equal',
  '<': 'less than',
  '>': 'greater than',
  '<=': 'less than or equal to',
  '>=': 'greater than or equal to',
  'STARTS WITH': 'starts with',
  'ENDS WITH': 'ends with',
  'CONTAINS': 'contains',
  'IS': 'is',
  'IS NOT': 'is not'
}

/**
 * Transform operators to add a `label` and `value` object
 */
const transformOperators = (operators) => operators.map(operator => {
  return {
    label: propOr('', operator, operatorMap),
    value: operator
  }
})

export default {
  name: 'SearchFilter',

  components: {
    SearchFilterCriteria,
    SearchFilterInput
  },

  mixins: [
    Request
  ],

  model: {
    prop: 'filter'
  },

  props: {
    targets: {
      type: Array,
      default: () => []
    },
    filter: {
      type: Object,
      default: () => {}
    },
    isLoadingTargets: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    lockTarget: {
      type: Boolean,
      default: false
    },
    showDatasetLabel: {
      type: Boolean,
      default: false
    }
  },

  data: function() {
    return {
      isTargetPopoverVisible: false,
      isPropertiesPopoverVisible: false,
      isOperationsPopoverVisible: false,
      targetInputVal: '',
      properties: [],
      propertiesDataset: [
        {
          label: 'Properties',
          items: [
            {
              value: 'name',
              label: 'Name'
            },
            {
              value: 'size',
              label: 'Size'
            }
          ]
        }
      ],
      isLoadingProperties: false,
      isLoadingValueSuggestions: false,
      targetInput: '',
      valueSuggestions: [],
      valueSuggestionsPrefix: null
    }
  },

  computed: {
    ...mapState([
      'activeOrganization',
      'config',
      'userToken'
    ]),
    ...mapState('metadataModule',[
      'filterParams'
    ]),

    /**
     * Compute if the filter is invalid
     * @returns {Boolean}
     */
    isInvalid: function() {
      return propOr(false, 'isInvalid', this.filter)
    },

    /**
     * Compute active organization intId
     * @returns {String}
     */
    activeOrganizationIntId: function() {
      return pathOr('', ['organization', 'intId'], this.activeOrganization)
    },

    /**
     * Compute operators from the filter
     * @returns {Array}
     */
    operations: function() {
      const operators = propOr([], 'operators', this.filter)
      return [
        {
          label: 'Operations',
          items: operators
        }
      ]
    },

    /**
     * Compute if the placeholder should be visible
     * @returns {Boolean}
     */
    isPlaceholderVisible: function() {
      return this.targetInput === '' && this.filter.target === ''
    },

    /**
     * Compute property data type
     * @returns {String}
     */
    propertyDataType: function() {
      return pathOr('', ['propertyType', 'type'], this.filter)
    }
  },

  watch: {
    /**
     * Watch the target and set the properties
     * so they can be displayed in the properties dropdown
     * This will fetch the model's properties if applicable
     */
    'filter.target': {
      handler: function() {
        if (this.filter.type === 'model') {
          this.getModelProperties(this.filter.target)
        } else {
          this.properties = Object.assign([], this.propertiesDataset)
        }
      },
      immediate: true
    }
  },

  methods: {

    /**
     * Checks if filter property has unit
     * @returns {String}
     */
    propertyHasUnit: function(propertyType) {
      const unit = propOr('', 'unit', propertyType)
      return getUnitDisplayName(pathOr(unit, ['items', 'unit'], propertyType))
    },
    /**
     * Focus on the last input
     */
    focus: function() {
      const inputs = [
        this.$refs.criteriaTarget,
        this.$refs.criteriaProperty,
        this.$refs.criteriaOperations,
        this.$refs.filterInput
      ]

      const target = compose(
        last,
        reject((item) => item === undefined)
      )(inputs)

      if (target) {
        /**
         * Need to use setTimeout to prevent
         * dismissPopover v-click-outside event
         * listener from firing
         */
        window.setTimeout(()=> {
          target.focus()
        })
      }
    },

    /**
     * Set target filter
     * This sets the `type`, `target` and `targetLabel` key
     * @param {Object} item
     * @param {String} type
     */
    setTargetFilter: function(item, type) {
      const id = propOr('', 'value', item)
      const intId = propOr(0, 'intId', item)
      const targetLabel = propOr('', 'label', item)

      // Code functionality for display names
      const filter = merge(this.filter, {
        type,
        target: id,
        targetIntId: intId,
        targetLabel,
        property: '',
        propertyLabel: '',
        propertyType: '',
        operation: '',
        operators: [],
        value: ''
      })

      // Reset value suggestions
      this.resetValueSuggestions()

      // Emit event to update filter
      this.$emit('input', filter)

      // Dismiss target popover
      this.isTargetPopoverVisible = false

      // Focus on the next input
      if (type === 'model') {
        this.$nextTick(() => {
          this.$refs.criteriaProperty.focus()
        })
      }
    },

    /**
     * Set properties filter
     * This sets the `property` and `propertyLabel` key
     * @param {Object} item
     */
    setPropertyFilter: function(item) {
      const property = propOr('', 'value', item)
      const propertyLabel = propOr('', 'label', item)
      const propertyType = propOr({}, 'dataType', item)

      // Set operations given the selected property
      const operators = compose(
        transformOperators,
        propOr('', 'operators')
      )(item)

      // Code functionality for display names
      const filter = merge(this.filter, {
        property,
        propertyLabel,
        propertyType,
        operation: '',
        operators,
        value: ''
      })

      // Reset value suggestions
      this.resetValueSuggestions()

      // Emit event to update filter
      this.$emit('input', filter)

      // Dismiss target popover
      this.isPropertiesPopoverVisible = false

      // Focus on the next input
      this.$nextTick(() => {
        this.$refs.criteriaOperations.focus()
      })
    },

    /**
     * Set operation filter
     * This sets the `operation` and `operationLabel` key
     * @param {Object} item
     */
    setOperationFilter: function(item) {
      const operation = propOr('', 'value', item)
      const operationLabel = propOr('', 'label', item)

      // Code functionality for display names
      const filter = merge(this.filter, {
        operation,
        operationLabel,
        value: ''
      })

      // Reset value suggestions
      this.resetValueSuggestions()

      // Emit event to update filter
      this.$emit('input', filter)

      // Dismiss target popover
      this.isOperationsPopoverVisible = false

      // Focus on the next input
      this.$nextTick(() => {
        this.$refs.filterInput.focus()
      })
    },

    /**
     * Get model properties to display in the
     * properties search filter criteria
     * @param {String} id
     */
    getModelProperties: function(id) {
      // Set properties loading state
      this.isLoadingProperties = true

      const baseUrl = `${this.config.conceptsUrl}/v2/organizations/${this.activeOrganizationIntId}/autocomplete/models/${this.filter.target}`

      const url = this.filter.datasetIntId
        ? `${baseUrl}?datasetId=${this.filter.datasetIntId}`
        : baseUrl

      this.sendXhr(url, {
        header: {
          'Authorization': `Bearer ${this.userToken}`
        }
      })
        .then(response => {
          const properties = transformProperties(response)

          this.properties = [
            {
              label: 'Properties',
              items: properties
            }
          ]
        })
        .catch(this.handleXhrError.bind(this))
        .finally(() => {
          // Set properties loading state
          this.isLoadingProperties = false
        })
    },

    /**
     * Reset value suggestions
     */
    resetValueSuggestions: function() {
      this.valueSuggestionsPrefix = null
      this.valueSuggestions = []
    },

    /**
     * On delete event for the property filter
     * delete the target filter
     */
    onDeleteProperty: function() {
      // Disallow if the target is locked
      if (this.lockTarget) {
        return
      }

      const filter = merge(this.filter, {
        type: '',
        target: '',
        targetLabel: '',
        property: '',
        propertyLabel: '',
        operation: '',
        operators: []
      })

      // Emit event to update filter
      this.$emit('input', filter)

      // Focus on the previous input
      this.$nextTick(() => {
        this.$refs.criteriaTarget.focus()
      })
    },

    /**
     * On delete event for the operations filter
     * delete the property filter
     */
    onDeleteOperation: function() {
      const filter = merge(this.filter, {
        property: '',
        propertyLabel: '',
        operation: ''
      })

      // Emit event to update filter
      this.$emit('input', filter)

      // Focus on the previous input
      this.$nextTick(() => {
        this.$refs.criteriaProperty.focus()
      })
    },

    /**
     * On delete event for the filter value
     */
    onDeleteFilterValue: function() {
      const filter = merge(this.filter, {
        operation: '',
        value: ''
      })

      // Emit event to update filter
      this.$emit('input', filter)

      // Focus on the previous input
      this.$nextTick(() => {
        this.$refs.criteriaOperations.focus()
      })
    },

    /**
     * On filter input, emit event and get value suggestions
     * @param {Event} evt
     */
    onFilterInput: function(evt) {
      console.log("input changed")
      this.$emit('input-value')
      this.getValueSuggestions(evt)
    },

    async autocomplete (prefix) {
      const url = `${this.config.api2Url}/metadata/query/autocomplete?dataset_id=${this.$route.params.datasetId}`

      let requestFilters = this.filterParams.filter(value => {
        return value.value != ''
      }).map(value => {
        return {
          "model": value.target,
          "property": value.property,
          "operator": value.operation,
          "value": value.value
        }
      })
      //
      // let requestFilters = this.filterParams.map(value => {
      //   return {
      //     "model": value.model,
      //     "property": value.property,
      //     "operator": value.operator,
      //     "value": value.value
      //   }
      // })

      let queryBody = {
        model: this.filter.target,
        filters: requestFilters,
        text: prefix,
        property: this.filter.property
      }

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.userToken}`
        },
        body: JSON.stringify(queryBody)
      })

      if (resp.ok) {
        const response = await resp.json()
        this.valueSuggestions = response.values
      }

      this.isLoadingValueSuggestions = false
    },


    getValueSuggestions: debounce(function(evt) {
      const prefix = defaultTo('', evt)

      /**
       * Do not make the request if the prefix
       * was already requested and loaded
       */
      if (prefix === this.valueSuggestionsPrefix && prefix != '') {
        return
      }

      this.valueSuggestionsPrefix = prefix

      // Set properties loading state
      this.isLoadingValueSuggestions = true

      // Reset current value suggestions
      this.valueSuggestions = []
      this.autocomplete((prefix))
    })
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';

.search-filter-content {
  display: flex;
  align-items: center;
}
.search-filter-wrap {
  align-items: center;
  border-radius: 3px;
  border: 1px solid #dadada;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-height: 40px;
  overflow: hidden;
  padding: 7px 14px;
  &.is-invalid {
    border-color: $error-color
  }
  &:last-child {
    margin-right: 0;
  }
  &.disabled {
    cursor: not-allowed
  }
}
.btn-delete {
  color: $gray_4;
  &:hover, &:focus {
    color: $app-primary-color;
  }
}
.search-filter-criteria-wrap {
  align-items: center;
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  height: 24px;
}
.filter-criteria {
  margin-right: 8px;
  &:last-child {
    width:100%;

    /deep/ input {
      width: 100%;
      flex: 1;
      max-width: none;
      border: none;
      border-bottom: 1px solid $gray_4;
      padding: 4px 0 2px 4px;
    }

  }
  &.no-flex {
    flex: none
  }


}
.msg-invalid {
  color: $error-color
}
.placeholder {
  color: $gray_4;
  font-style: italic;
  pointer-events: none;
  position: absolute;
}
</style>
