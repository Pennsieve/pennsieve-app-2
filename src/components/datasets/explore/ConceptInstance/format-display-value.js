import {defaultTo, propOr} from 'ramda'

import FormatDate from '../../../../mixins/format-date'
import { getFormatter } from '../../../../mixins/data-type/utils'

/**
 * Capitalize string
 * @param {String} str
 * @returns {String}
 */
const capitalize = str => {
  const input = defaultTo('', str).toString()
  return input.charAt(0).toUpperCase() + input.slice(1)
}

const replaceLineBreaks = str => {
  return Object.prototype.toString.call(str) === '[object String]' ? str.replace(/(\r\n|\n|\r)/g, '<br>') : str
}

export default {
  mixins: [
    FormatDate
  ],

  methods: {
    /**
     * Formats a single value
     * @param {String} dataType
     * @param {String} value
     * @returns {String}
     */
    formatSingleValue: function(dataType, value) {
        if (dataType === 'Date' && value) {
          return this.formatDate(value)
        }

        if (dataType === 'Double' && value) {
          let number = value

          // Convert to fixed value to display decimal
          if (value === Math.floor(value)) {
            number = value.toFixed(1)
          }
          return number
        }

        if (dataType === 'Boolean' && value !== null) {
          return capitalize(value)
        }

        return replaceLineBreaks(value)
   },

   /**
    * Format numeric values that are associated with scientific units
    * @param {Object} dataType
    * @param {Number} value
    * @param {String} unit
    */
   formatScientificUnitValues: function(dataType, value, unit) {
      if (dataType.type === 'Double' && value) {
        let number = value

       // Convert to fixed value to display decimal
       if (value === Math.floor(value)) {
         number = value.toFixed(1)
       }
       number = `${number} ${unit}`
       return number
      }

      if (dataType.type === 'Long' && value) {
        return `${value} ${unit}`
      }
   },

   /**
    * Format updated records for activities
    * @param {Object} property
    * @param {String} value
    */
   formatActivityValueForRecords: function(property, value) {
     const dataType = propOr('', 'dataType', property)
     if (value === null) {
       return '--'
     } else if (Array.isArray(value)) {
      const formatter = getFormatter(dataType)
      return value.map(v => formatter(v)).join(', ')
     } else if (dataType.hasOwnProperty('unit')) {
       return this.formatScientificUnitValues(dataType, value, dataType.unit)
     } else {
       return this.formatSingleValue(dataType, value)
     }

    },
    /**
     * Format the value to display
     * @param {Object} property
     * @returns {String}
     */
    formatDisplayValue: function(property) {
      let unit = ''
      const value = propOr('', 'value', property)
      const dataType = propOr('', 'dataType', property)
      if (typeof dataType === 'object') {
        if (dataType.items) {
          unit = propOr('', 'unit', dataType.items)
        } else {
          unit = propOr('', 'unit', dataType)
        }
        return this.formatScientificUnitValues(dataType, value, unit)
      }
      return this.formatSingleValue(dataType, value)
    },

    /**
     * Format the value to display for scientific units and string subtypes
     * @param {Object} property
     * @returns {String}
     */
    formatUniqueDisplayValues: function(property, individualValue) {
      const formatter = getFormatter(property.dataType);
      if (individualValue) {
        return formatter(individualValue)
      }
      if (Array.isArray(property.value)) {
        return property.value.map(v => formatter(v)).join(', ')
      }
      return formatter(property.value)
    }
  }
}
