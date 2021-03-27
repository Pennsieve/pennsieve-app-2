import {defaultTo, path, pathOr, propOr} from 'ramda'

/**
 * Translates specific formatting terms to display values
 * @param {String} dataType
 */
const getFormattedType = (dataType) => {
  const formats = {
    'DateTime': 'Date',
    'Long': 'Number',
    'Double': 'Decimal'
  }

   if (!dataType.unit) {
    return propOr(dataType, dataType, formats)
   }
  return propOr(dataType, dataType.type, formats)
}

export default {
  methods: {
    /**
     * Returns the raw data type value
     * @param {Object} property
     * @returns {String}
     */
    getRawDataType: function(property) {
      const defaultType = propOr('', 'dataType', property)
      if (defaultType.unit || defaultType.unit === '') {
        return defaultType.type
      }

      if (defaultType.type === 'String' && ['Email', 'URL'].includes(defaultType.format)) {
        return defaultType.type
      }

      const complexType = pathOr(defaultType, ['dataType', 'items', 'type'], property)
      const stringType = path(['dataType', 'format'], property)
      return defaultTo(complexType, stringType)
    },
    /**
     * Returns formatted data type
     * @param {Object} property
     * @returns {String}
     */
    formatDataType: function(property) {
      const dataType = this.getRawDataType(property)
      return getFormattedType(dataType)
    },
  }
}