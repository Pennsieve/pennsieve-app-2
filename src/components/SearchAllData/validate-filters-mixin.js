import { compose, contains, props, propEq } from 'ramda'

/**
 * Get required filters
 * @param {Object} search
 * @param {Object} filter
 * @returns {Array}
 */
const getRequiredFilters = (search, filter) => {
  const emptyTarget = propEq('target', '', filter)

  if (search.filters.length === 1 && emptyTarget) {
    return []
  }

  return filter.type === 'model'
    ? ['target', 'property', 'operation', 'value']
    : ['target']
}

export default {

  data() {
    return {
      search: {
        model: null,
        isModelInvalid: false,
        filters: []
      }
    }
  },

  methods: {
    /**
     * Validate search and ensure that all
     * filters are complete
     * @returns {Boolean}
     */
    validateSearch: function() {
      const isModelInvalid = this.search.model === ''
      this.search.isModelInvalid = isModelInvalid
      this.search.filters = this.validateFilters()

      return isModelInvalid
    },

    /**
     * Validate filters for search
     * @returns {Boolean}
     */
    validateFilters: function() {
      // Validate filters
      return this.search.filters.map(filter => {
        const requiredFields = getRequiredFilters(this.search, filter)

        const isFilterInvalid = compose(
          contains(''),
          props(requiredFields)
        )(filter)

        return {
          ...filter,
          isInvalid: isFilterInvalid
        }
      })
    }
  }
}
