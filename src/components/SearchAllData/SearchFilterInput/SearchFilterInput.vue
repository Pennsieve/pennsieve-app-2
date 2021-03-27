<template>
  <div
    v-click-outside="dismissPopover"
    class="search-filter-input"
  >
    <template v-if="!isDate">
      <input
        v-if="!isNumber"
        ref="input"
        type="text"
        :value="value"
        :readonly="isInputReadOnly"
        @input="$emit('input', $event.target.value)"
        @focus="onInputFocus"
        @keydown.delete="onDelete"
      >

      <input
        v-if="isNumber"
        ref="input"
        type="number"
        :value="value"
        :readonly="isInputReadOnly"
        @input="onNumberInput"
        @focus="onInputFocus"
        @keydown.delete="onDelete"
      >
    </template>

    <!-- Date property type -->
    <el-date-picker
      v-if="isDate"
      ref="datePicker"
      :value="value"
      :append-to-body="false"
      type="date"
      prefix-icon=""
      placeholder="Choose a date"
      transition=""
      format="M/d/yyyy"
      value-format="yyyy-MM-ddTHH:mm:ss.000+00:00"
      :default-value="suggestedDateFirst"
      :picker-options="pickerOptions"
      @change="$emit('input', $event)"
      @input="$emit('input', $event)"
      @focus="onInputFocus"
      @keydown.native.delete="onDelete"
    />

    <el-popover
      ref="popover"
      v-model="isPopoverVisible"
      popper-class="no-padding scroll"
      placement="bottom-start"
      trigger="manual"
      :append-to-body="false"
      :visible-arrow="false"
      :popper-options="{
        modifiers: [ 'offset', 'preventOverflow', popoverModifier, 'applyStyle' ]
      }"
    >
      <div
        v-if="loading"
        class="bf-menu"
      >
        <div class="loading-list">
          Loading
        </div>
      </div>

      <!-- Autosuggestions for values -->
      <div
        v-if="!isEnum && !isNumber && !isBoolean && !isDate && !loading"
        class="bf-menu scroll-menu"
      >
        <ul v-if="valueSuggestions.length">
          <h2>Suggested values</h2>
          <ul>
            <li
              v-for="option in valueSuggestions"
              :key="option"
            >
              <a
                href="#"
                class="bf-menu-item"
                @click.prevent="onOptionClick(option)"
              >
                {{ option }}
              </a>
            </li>
          </ul>
        </ul>
        <p
          v-if="valueSuggestions.length === 0"
          class="filter-empty-state"
        >
          No suggestions found
        </p>
      </div>

      <!-- Show range for number and datee property type -->
      <div
        v-if="isNumber && !loading"
        class="bf-menu scroll-menu"
      >
        <ul v-if="valueSuggestions.length">
          <h2>Suggested values</h2>
          <p class="filter-suggestion-range mb-0">
            {{ valueRangeSuggestion }}
          </p>
        </ul>
        <p
          v-if="valueSuggestions.length === 0"
          class="filter-empty-state"
        >
          No suggestions found
        </p>
      </div>

      <!-- Enum property type -->
      <div
        v-if="isEnum && !loading"
        class="bf-menu scroll-menu"
      >
        <ul>
          <h2>Values</h2>
          <ul>
            <li
              v-for="option in enumOptions"
              :key="option"
            >
              <a
                href="#"
                class="bf-menu-item"
                @click.prevent="onOptionClick(option)"
              >
                {{ option }}
              </a>
            </li>
          </ul>
        </ul>
      </div>

      <!-- Boolean property type -->
      <div
        v-if="isBoolean && !loading"
        class="bf-menu scroll-menu"
      >
        <ul>
          <h2>Values</h2>
          <ul>
            <li
              v-for="option in booleanOptions"
              :key="option.value"
            >
              <a
                href="#"
                class="bf-menu-item"
                @click.prevent="onOptionClick(option.value)"
              >
                {{ option.label }}
              </a>
            </li>
          </ul>
        </ul>
      </div>
    </el-popover>
  </div>
</template>

<script>
import {
  compose,
  defaultTo,
  head,
  last,
  pathOr,
  propOr,
  propEq,
  take
} from 'ramda'

import Moment from 'moment'
import { extendMoment } from 'moment-range'
const moment = extendMoment(Moment)

/**
 * Get suggestion type and convert to user friendly value
 * @param {Object} type
 * @returns {String}
 */
const getSuggestionType = (propertyType) => {
  const dict = {
    'Long': 'number',
    'Double': 'decimal',
    'Date': 'date'
  }
  const type = propOr('', 'type', propertyType)
  return defaultTo('', dict[type])
}

export default {
  name: 'SearchFilterInput',

  props: {
    propertyType: {
      type: [String, Object],
      default: ''
    },
    value: {
      type: [String, Number, Boolean],
      default: ''
    },
    valueSuggestions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: true
    }
  },

  data: function() {
    return {
      isPopoverVisible: false,
      booleanOptions: [
        {
          label: 'True',
          value: true
        },
        {
          label: 'False',
          value: false
        }
      ],
      pickerOptions: {
        disabledDate: (date) => {
          return this.computeIsDisabledDate(date)
        }
      }
    }
  },

  computed: {
    /**
     * Compute the first date in the suggested range
     * @returns {String}
     */
    suggestedDateFirst: function() {
      return this.isDate
        ? compose(
            take(10),
            defaultTo(''),
            head
          )(this.valueSuggestions)
        : ''
    },

    /**
     * Compute the last date in the suggested range
     * @returns {String}
     */
    suggestedDateLast: function() {
      return this.isDate
        ? compose(
            take(10),
            defaultTo(''),
            last
          )(this.valueSuggestions)
        : ''
    },

    /**
     * Compute if the input is read only
     * Depending on the property type
     * @returns {Boolean}
     */
    isInputReadOnly: function() {
      return this.isEnum || this.isBoolean || this.isDate
    },

    /**
     * Computes whether property accepts multiple values
     * @returns {Boolean}
     */
    hasMultiValues: function() {
      return propEq('type', 'Array', this.propertyType)
    },

    /**
     * Computes whether or not enum field is present
     * @returns {Boolean}
     */
    isEnum: function() {
      return propEq('type', 'Enum', this.propertyType)
    },

    /**
     * Computes if the property type is Boolean
     * @returns {Boolean}
     */
    isBoolean: function() {
      return propEq('type', 'Boolean', this.propertyType)
    },

    /**
     * Computes if the property type is Date
     * @returns {Boolean}
     */
    isDate: function() {
      return propEq('type', 'Date', this.propertyType)
    },

    /**
     * Computes if the property type is a Number
     * @returns {Boolean}
     */
    isNumber: function() {
      const isDouble = propEq('type', 'Double', this.propertyType)
      const isLong = propEq('type', 'Long', this.propertyType)

      return isDouble || isLong
    },

    /**
     * Compute options for enum property type
     * @returns {Array}
     */
    enumOptions: function() {
      return pathOr([], ['items', 'enum'], this.propertyType)
    },

    /**
     * Compute value range suggestion copy
     * @returns {String}
     */
    valueRangeSuggestion: function() {
      const type = getSuggestionType(this.propertyType)
      const lowestValue = head(this.valueSuggestions)
      const highestValue = last(this.valueSuggestions)

      return `Type a ${type.toLowerCase()} value between ${lowestValue} and ${highestValue}`
    },

    /**
     * Compute value range suggestion copy
     * @returns {String}
     */
    valueSuggestionDateRange: function() {
      const lowestValue = head(this.valueSuggestions)
      const highestValue = last(this.valueSuggestions)

      return moment.range(`${lowestValue}/${highestValue}`)
    }
  },
  mounted: function() {
    /**
     * Set the popover references so they can be positioned and full width
     * `el-popover` doesn't allow for this to be dynamic
     */
    this.$refs.popover.$refs.reference = this.$parent.$refs.inputWrap

    if (this.isDate) {
      this.setupDatePicker()
    }
  },

  methods: {
    /**
     * Get allowed dates
     * @param {String} date
     * @returns {Boolean}
     */
    computeIsDisabledDate: function(date) {
      // Don't compute if the property type isn't a date
      if (!this.isDate) {
        return false
      }

      const isSameOrAfter = moment(date).isSameOrAfter(this.suggestedDateFirst)
      const isSameOrBefore = moment(date).isSameOrBefore(this.suggestedDateLast)
      const isAllowed = isSameOrAfter && isSameOrBefore

      return !isAllowed
    },

    onInputFocus: function() {
      this.isPopoverVisible = true
      this.$emit('focus')
    },

    /**
     * Set up date picker options
     * We need to customize how the date picker looks,
     * and Element doesn't give us a way to do this via slots
     * or props. This is hacky, but it is the only way to do it.
     */
    setupDatePicker: function() {
      const datePicker = this.$refs.datePicker

      datePicker.visibleArrow = false
      datePicker.$refs.reference = this.$parent.$refs.inputWrap
      datePicker.popperOptions = {
        modifiers: [ 'offset', 'preventOverflow', this.popoverModifier, 'applyStyle' ]
      }
    },

    /**
     * Compute placement and width for popover
     * @param {Object}
     * @returns {Object}
     */
    popoverModifier: function(data) {
      // Set offset
      data.offsets.popper.top -= 22

      // Set to width of reference (so it's full width of input)
      data.styles.width = data.offsets.reference.width

      return data
    },

    /**
     * Focus on the text input
     */
    focus: function() {
      if (this.isDate) {
        /*
         * Workaround
         * Calling the focus event on the component itself isn't working
         * This is due to the reference being changed to allow for the width
         * to be full width of the filter
         */
        this.$refs.datePicker.refInput[0].focus()
      } else {
        this.$refs.input.focus()
      }
    },

    /**
     * On delete key press
     * Emit delete event if the value is empty
     * @param {Object} evt
     */
    onDelete: function(evt) {
      if (evt.target.value === '') {
        this.$emit('delete')
      }
    },

    /**
     * Dismiss popover
     */
    dismissPopover: function() {
      this.isPopoverVisible = false
    },

    /**
     * Callback of clicking an option in the dropdown
     * Emit event and close popover
     * @param {String} value
     */
    onOptionClick: function(value) {
      this.dismissPopover()
      this.$emit('input', value)
    },

    /**
     * Format the number and event value
     * This is used to convert the `String` value to a `Number`
     */
    onNumberInput: function(evt) {
      const val = Number(evt.target.value)
      const number = val == '' || val == null
        ? null
        : Number(val)

      this.$emit('input', number)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';
input,
/deep/ .el-date-editor .el-input__inner {
  background: none;
  border: 1px solid $app-primary-color;
  border-radius: 0;
  box-sizing: border-box;
  color: $myelin;
  font-size: inherit;
  height: auto;
  line-height: inherit;
  outline: none;
  padding: 2px 5px;
  width: 110px
}
input {
  max-width: 110px;
}
/deep/ .el-date-editor {
  position: static;
}
/deep/ .el-picker-panel__body {
  max-width: 307px;
}
/deep/ .el-picker-panel {
  transition: none !important;
}
/deep/ .el-date-editor .el-input__prefix,
/deep/ .el-date-editor .el-input__suffix {
  display: none;
}
.loading-list {
  padding: 8px 16px;
}
.filter-empty-state {
  font-style: italic;
  margin: 0;
}
.filter-suggestion-range,
.filter-empty-state {
  padding: 8px 16px 8px 24px;
}
</style>
