<template>
  <div class="concept-query-filter">
    <el-select
      v-model="conceptValue"
      class="conceptMenu"
      @change="updateRelatedFields"
    >
      <el-option
        v-for="concept in concepts"
        :key="concept.id"
        :label="concept.displayName"
        :value="concept.name"
      />
    </el-select>

    <el-select
      v-model="relatedFieldsValue"
      @change="updateSelectedRelatedField"
    >
      <el-option
        v-for="field in relatedFields.filter(f => typeof f.dataType !== 'object' || f.dataType.type === 'enum')"
        :key="field.id"
        :label="field.name"
        :value="field.value"
      />
    </el-select>

    <el-select
      v-model="operatorValue"
      class="condensed"
      @change="updateSelectedOperator"
    >
      <el-option
        v-for="operator in operators"
        :key="operator.id"
        :label="operator.name"
        :value="operator.value"
      />
    </el-select>

    <el-input
      v-if="validateType('String')"
      v-model="inputValue"
      autofocus
      @input="updateValueToCompare"
    />

    <el-input
      v-if="validateType('Double') || validateType('Long')"
      v-model="inputValue"
      :controls="false"
      type="number"
      @input="updateValueToCompare"
    />

    <el-select
      v-if="validateType('Boolean')"
      v-model="inputValue"
      autofocus
      @change="updateValueToCompare"
    >
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
      v-model="inputValue"
      type="date"
      v-if="validateType('Date')"
      placeholder="Pick a day"
      autofocus
      format="M/d/yyyy"
      value-format="yyyy-MM-ddTHH:mm:ss.00+0000"
      @change="updateValueToCompare"
    />

    <el-select
      v-if="validateType('enum')"
      v-model="inputValue"
      class="condensed"
      @change="updateValueToCompare"
    >
      <el-option
        v-for="item in enumValues"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>

    <button
      id="removeFilterButton"
      @click="removeFilter"
    >
      <svg-icon
        name="icon-remove"
        class="tools"
        height="10"
        width="10"
      />
    </button>
  </div>
</template>

<script>
import AutoFocus from '../../../../mixins/auto-focus'
import moment from 'moment'
import { path, defaultTo, find, propEq, propOr, pathOr } from 'ramda'

export default {
  name: 'ConceptQueryFilter',

  mixins: [
    AutoFocus
  ],

  props: {
    concepts: {
      type: Array,
      default: function() {
        return []
      }
    },
    relatedFields: {
      type: Array,
      default: function() {
        return []
      }
    },
    id: {
      type: Number,
      default: 0
    },
    selectedConcept: {
      type: String,
      default: ''
    },
    selectedRelatedField: {
      type: String,
      default: ''
    },
    selectedOperator: {
      type: String,
      default: 'eq'
    },
    valueToCompare: {
      type: [String, Number, Boolean],
      default: ''
    },
  },

  data() {
    return {
      operators: [
        {id: 1, name: 'Equals', value: 'eq'},
        {id: 2, name: 'Not Equals', value: 'neq'}
      ],
      conceptValue: '',
      relatedFieldsValue: '',
      operatorValue: '',
      inputValue: '',
      enumValues: [],
    }
  },

  watch: {
    selectedConcept: function(concept) {
      this.conceptValue = concept
    },
    selectedRelatedField: function(field) {
      this.relatedFieldsValue = field
      const _enumValues = find(propEq('value', this.selectedRelatedField), this.relatedFields)
      this.enumValues = pathOr([], ['dataType', 'items', 'enum'],_enumValues)
    },
    selectedOperator: function(operator) {
      this.operatorValue = operator
    },
    valueToCompare: function(val) {
      this.inputValue = defaultTo('', val)
    }
  },

  mounted() {
    this.setSelectValues()
  },

  methods: {
    /**
     * Validate data type
     * @param {String} dType
     * @returns {Boolean}
     */
    validateType: function(dType) {
      const relatedFieldObj = find(propEq('value', this.relatedFieldsValue), this.relatedFields)
      const dataType = propOr('String', 'dataType', relatedFieldObj)
      const prop = typeof dataType === 'object' ? dataType.type : dataType
      return prop === dType
    },
    /**
     * Sets default input value
     * @returns {String}
     */
    setDefaultInputValue: function() {
      switch(true) {
        case this.validateType('Boolean'):
          return true
        case this.validateType('Date'):
          return moment().format('YYYY-MM-DDTHH:mm:ss.00+0000')
        default:
          return ''
      }
    },
    /**
     * Sets drop down menu selected values
     */
    setSelectValues: function() {
      this.conceptValue = this.selectedConcept
      this.relatedFieldsValue = defaultTo('', this.selectedRelatedField)
      this.operatorValue = this.selectedOperator

      const defaultInputValue = this.setDefaultInputValue()
      this.inputValue = defaultTo(defaultInputValue, this.valueToCompare)

      this.autoFocus()
    },
    /**
     * fires event to get the related fields for a given concept
     */
    updateRelatedFields: function() {
      this.$emit('update-related-fields', {
        selectedConcept: this.conceptValue,
        id: this.id,
        isFileProxy: this.isFileProxy
      })
    },
    /**
     * fires event to update the selected related field
     */
    updateSelectedRelatedField: function() {
      this.$emit('update-selected-related-field', {
        selectedRelatedField: this.relatedFieldsValue,
        id: this.id
      })
      this.inputValue = this.setDefaultInputValue()
      this.updateValueToCompare()
    },
    /**
     * fires event to update the selected operator
     */
    updateSelectedOperator: function() {
      this.$emit('update-selected-operator', {
        selectedOperator: this.operatorValue,
        id: this.id
      })
    },
    /**
     * fires event to update the value to compare
     */
    updateValueToCompare: function() {
      let valueToCompare = this.inputValue

      if (this.validateType('Double') || this.validateType('Long')) {
        valueToCompare = Number(this.inputValue)
      }

      this.$emit('update-value-to-compare', {
        valueToCompare,
        id: this.id
      })
    },
    /**
     * fires custom event to remove the selected filter from a list
     */
    removeFilter: function() {
      this.$emit('remove-concept-filter', this.id)
      this.autoFocus()
    }
  }
}
</script>

<style lang="scss">
.concept-query-filter {
  .el-select, .el-input {
    max-width: 150px;
  }

  .el-select {
    margin-right: 4px;

    &.condensed {
      .el-input {
        max-width: 120px;
      }
    }
  }
  .el-input input::-webkit-inner-spin-button {
    display: none;
  }
}
</style>
