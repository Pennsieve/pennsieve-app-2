import Vue from 'vue'
import { propOr, find, propEq } from 'ramda'

/**
 * Get properties array for given category from list of top level file properties
 * @param {Array} fileProperties
 * @param {String} category
 * @returns {Array}
 */
const getCategoryProperties = (fileProperties = [], category = 'Pennsieve') => {
  const categoryProperties = find(propEq('category', category), fileProperties)
  return propOr([], 'properties', categoryProperties)
}

export default {
  methods: {
    /**
     * Get property object from list of given file properties and specified category
     * @param {Array} properties
     * @param {String} propertyName
     * @param {String} category
     * @returns {Object}
     */
    getFileProperty: function(properties, propertyName, category) {
      const categoryProperties = getCategoryProperties(properties, category)
      return find(propEq('key', propertyName), categoryProperties)
    },

    /**
     * Get property value from list of given file properties and specified category
     * @param {Array} properties
     * @param {String} propertyName
     * @param {String} category
     * @returns {String}
     */
    getFilePropertyVal: function(properties, property, category) {
      const propertyObj = this.getFileProperty(properties, property, category)
      return propOr('', 'value', propertyObj)
    }
  }
}
