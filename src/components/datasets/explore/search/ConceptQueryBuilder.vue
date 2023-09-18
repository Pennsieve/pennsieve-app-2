<template>
  <div class="query-builder">
    <concept-query-filter
      v-for="queryFilter in queryFilters"
      :id="queryFilter.id"
      :key="queryFilter.id"
      :item="queryFilter"
      :concepts="concepts"
      :selected-concept="queryFilter.selectedConcept"
      :related-fields="queryFilter.relatedFields"
      :selected-related-field="queryFilter.selectedRelatedField"
      :selected-operator="queryFilter.selectedOperator"
      :value-to-compare="queryFilter.valueToCompare"
      @remove-concept-filter="handleRemoveFilter"
      @update-related-fields="handleRelatedFieldsUpdate"
      @update-selected-related-field="handleUpdateSelectedRelatedField"
      @update-selected-operator="handleUpdateSelectedOperator"
      @update-value-to-compare="handleUpdateValueToCompare"
    />

    <div
      v-if="displaySearchError"
      class="el-form-item__error"
    >
      All fields are required
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ConceptQueryFilter from './ConceptQueryFilter.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import AutoFocus from '../../../../mixins/auto-focus'
import EncodeInternalFields from '../../../../mixins/encode-internal-fields'
import Request from '../../../../mixins/request'
import Sorter from '../../../../mixins/sorter'
import safelyParseJSON from '../../../../utils/safelyParseJson'
import { pluck, compose, propOr, useWith, find, propEq, head, defaultTo, tryCatch, always, pathOr } from 'ramda'

export default {
  name: 'ConceptQueryBuilder',

  components: {
    ConceptQueryFilter,
    BfButton
  },

  mixins: [
    AutoFocus,
    Request,
    Sorter,
    EncodeInternalFields,
  ],

  props: {
    concepts: {
      type: Array,
      default: function() {
        return []
      }
    },
    concept: {
      type: Object,
      default: function() {
        return {}
      }
    },
    isFilesProxy: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      displaySearchError: false,
      offset: 0,
      limit: 50,
      queryFilters: [],
      defaultOperator: 'eq',
      savedQueryFiltersKey: 'conceptQueryFilters'
    }
  },

  watch: {
    concept: function(concept) {
      if (Object.keys(concept).length) {
        this.setQueryFilters()
        this.newSearch()
      }
    }
  },

  mounted() {
    if (Object.keys(this.concept).length) {
      this.setQueryFilters()
      this.newSearch()
    }
  },

  computed: {
    ...mapGetters([
      'userToken',
      'dataset',
      'lastRoute',
      'config',
      'filesProxyId'
    ]),

    proxyProperties: function(){
      return {
        id: this.queryFilters.length + 1,
        isFileProxy: true,
        selectedConcept: 'Files',
        selectedOperator: 'eq',
        selectedRelatedField: 'name',
        relatedFields: [
          {
            name: 'name',
            displayName: 'Name',
            dataType: 'String'
          },
          {
            name: 'subtype',
            displayName: 'Kind',
            dataType: 'String'
          },
          {
            name: 'createdAt',
            displayName: 'Date Created',
            dataType: 'Date'
          },
          {
            name: 'updatedAt',
            displayName: 'Date Updated',
            dataType: 'Date'
          },
          {
            name: 'nodeId',
            displayName: 'ID',
            dataType: 'String'
          }
        ]
      }
    }
  },

  methods: {
    /**
     * Executes new search
     */
    newSearch: function() {
      this.offset = 0
      this.sortBy = 'createdAt'
      this.runSearch()
    },

    /**
     * Handles updated model search sort
     * @param {Object} sortObj
     */
    handleUpdateSearchSort: function(sortBy) {
      this.sortBy = defaultTo('createdAt', sortBy)
      this.offset = 0
      this.setSortDirection(this.sortBy)
      this.runSearch()
    },

    /**
     * Loads more records
     */
    handleLoadMoreRecords: function() {
      this.offset = this.offset + this.limit
      this.runSearch()
    },

    /**
     * Check last route and load saved queryFilters from localStorage if available
     */
    setQueryFilters: function() {
      const lastRouteName = propOr('', 'name', this.lastRoute)
      const storageValue = localStorage.getItem(this.savedQueryFiltersKey)
      if (lastRouteName === 'concept-instance' && storageValue) {
        this.queryFilters = safelyParseJSON([], storageValue)
      }
    },

    /**
     * Returns list of concept properties given a concept and a list of concepts
     * @param {String}
     * @returns {Promise}
     */
    getRelatedFields: function(conceptName) {
      if (conceptName === 'package') {
        const relatedFileFields = [
          {
            displayName: 'Name',
            name: 'Name',
            dataType: 'String'
          },
          {
            displayName: 'Type',
            name: 'Type',
            dataType: 'String'
          },
          {
            displayName: 'Created At',
            name: 'CreatedAt',
            dataType: 'Date'
          },
          {
            displayName: 'Updated At',
            name: 'UpdatedAt',
            dataType: 'Date'
          }
        ]
        return new Promise((resolve, reject) => resolve(relatedFileFields))
      }
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      const url = `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/${conceptName}/properties`
      return this.sendXhr(url, {
        header: {
          'Authorization': `bearer ${this.userToken}`
        }
      })
    },

    /**
     * Returns the first value within concept properties list
     * @param {Array}
     * @returns {String}
     */
    getSelectedValue: compose(
      propOr('', 'value'),
      head,
      defaultTo([{}])
    ),

    /**
     * Returns the index of the queryFilter array
     * @param {Object} evt
     * @returns {Number}
     */
    getQueryFilterIndex: evt => propOr(0, 'id', evt) - 1,

    /**
     * Handles update-related-fields custom event
     * @param {Object} evt
     */
    handleRelatedFieldsUpdate: function(evt) {
      // Check if the user is clicking on a package, and don't query for properties
      if (evt.isFileProxy) {
        // this.queryFilters.splice(index, 1, updatedQueryFilter)

        return
      }

      const selectedConcept = propOr('', 'selectedConcept', evt)

      this.getRelatedFields(selectedConcept)
        .then(rawData => {
          const relatedFields = rawData.map(field => {
            return {
              name: field.displayName,
              value: field.name,
              dataType: field.dataType
            }
          })
          const index = this.getQueryFilterIndex(evt)
          const selectedRelatedField = this.getSelectedValue(relatedFields)
          // reset other fields
          const selectedOperator = 'eq'

          const updatedQueryFilter = Object.assign({}, this.queryFilters[index], {
            selectedConcept,
            relatedFields,
            selectedRelatedField,
            selectedOperator
          })
          this.queryFilters.splice(index, 1, updatedQueryFilter)
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Handles update-selected-related-field custom event
     * @param {Object} evt
     */
    handleUpdateSelectedRelatedField: function(evt) {
      const selectedRelatedField = propOr('', 'selectedRelatedField', evt)
      const index = this.getQueryFilterIndex(evt)

      const updatedQueryFilter = Object.assign({}, this.queryFilters[index], { selectedRelatedField })
      this.queryFilters.splice(index, 1, updatedQueryFilter)
    },

    /**
     * Handles update-selected-operator custom event
     * @param {Object} evt
     */
    handleUpdateSelectedOperator: function(evt) {
      const selectedOperator = propOr('', 'selectedOperator', evt)
      const index = this.getQueryFilterIndex(evt)

      const updatedQueryFilter = Object.assign({}, this.queryFilters[index], { selectedOperator })
      this.queryFilters.splice(index, 1, updatedQueryFilter)
    },

    /**
     * Handles update-value-to-compare custom event
     * @param {Object} evt
     */
    handleUpdateValueToCompare: function(evt) {
      const valueToCompare = propOr('', 'valueToCompare', evt)
      const index = this.getQueryFilterIndex(evt)

      const updatedQueryFilter = Object.assign({}, this.queryFilters[index], { valueToCompare })
      this.queryFilters.splice(index, 1, updatedQueryFilter)
    },

    /**
     * Add a new filter to the query builder
     */
    addFilter: function() {
      // If the user is search files, use the hardcoded properties
      if (this.isFilesProxy) {
        this.queryFilters.push(this.proxyProperties)
      } else {
        const id = this.queryFilters.length + 1
        const selectedConcept = propOr('', 'name', this.concept)
        this.getRelatedFields(selectedConcept)
          .then(rawData => {
            const relatedFields = rawData.map(field => {
              return {
                name: field.displayName,
                value: field.name,
                dataType: field.dataType
              }
            })
            const selectedOperator = this.defaultOperator
            const selectedRelatedField = this.getSelectedValue(relatedFields)
            const newFilter = {
              id,
              selectedConcept,
              relatedFields,
              selectedRelatedField,
              selectedOperator
            }
            this.queryFilters.push(newFilter)
          })
          .catch(this.handleXhrError.bind(this))
      }
    },

    /**
     * Handles remove-concept-filter event
     * @param {Number} id
     */
    handleRemoveFilter: function(id) {
      this.queryFilters = this.queryFilters.filter(f => f.id !== id)
      if (this.queryFilters.length === 0) {
        this.offset = 0
      }
      this.displaySearchError = false
      // re-run search
      this.runSearch()
    },

    /**
     * Builds filters array for query
     * @param {Object} filter
     * @returns {Object}
     */
    _buildFilters: function(filter) {
      const obj = {
        'key': filter.selectedRelatedField,
        'predicate': {
          'operation': filter.selectedOperator,
          'value': filter.valueToCompare
        }
      }
      return obj
    },

    /**
     * Builds joins array for query
     * @param {Object} filter
     * @returns {Object}
     */
    _buildJoins: function(filter) {
      let targetType = {
        concept: {
          type: filter.selectedConcept
        }
      }
      if (filter.selectedConcept === 'package') {
        targetType = {
          proxy: {
            type: 'package'
          }
        }
      }
      return {
        targetType,
        filters: [this._buildFilters(filter)]
      }
    },

    /**
     * Validate query filters
     * @param {Array} filters
     * @returns {Boolean}
     */
    validateQueryFilters: function(filters) {
      const inputs = filters.filter(f => {
        const val  = propOr('', 'valueToCompare', f)
        return val.toString().length > 0
      })
      return filters.length === inputs.length
    },

    /**
     * Updates saved filters in localStorage
     * @param {Array} filters
     */
    updateSavedFilters: function(filters) {
      if (filters.length > 0) {
        return localStorage.setItem(this.savedQueryFiltersKey, JSON.stringify(filters))
      }
      localStorage.removeItem(this.savedQueryFiltersKey)
    },

    /**
     * Builds the search query
     */
    buildQuery: function() {
      this.displaySearchError = false
      const filters = this.queryFilters
      if (!this.validateQueryFilters(filters)) {
        this.displaySearchError = true
        return this.autoFocus()
      }
      this.updateSavedFilters(filters)

      const buildFilters = this._buildFilters.bind(this)
      const buildJoins = this._buildJoins.bind(this)

      const conceptName = propOr('', 'name', this.concept)

      const conceptFilters = filters.filter(fil => fil.selectedConcept === conceptName).map(buildFilters)
      const relatedFilters = filters.filter(fil => fil.selectedConcept !== conceptName).map(buildJoins)

      // Set up default type for all models
      let type = {
        concept: {
          type: conceptName
        }
      }

      // Change type to proxy if the user is searching package proxy type
      if (this.isFilesProxy) {
        type = {
          proxy: {
            type: 'package'
          }
        }
      }

      const baseObj = {
        type,
        filters: conceptFilters,
        joins: relatedFilters,
        offset: this.offset,
        limit: this.limit
      }

      const sortKey = this.sortDirection === 'asc' ? 'Descending' : 'Ascending'
      const sortObj = {
        orderBy: {
          [sortKey]: {
            field: this.prefixField(this.sortBy, false)
          }
        }
      }

      return Object.assign({}, baseObj, sortObj)
    },

    /**
     * Executes search query by applying filters
     */
    runSearch: function() {
      const query = this.buildQuery()
      if (!this.displaySearchError) {
        this.$emit('update-concept-search', query)
      }
    },

  }
}
</script>

<style lang="scss" scoped>
.concept-query-filter {
  margin-bottom: 8px;
}
.query-builder-buttons {
  margin-top: 16px;
}
.secondary {
  margin-right: 8px;
}
</style>
