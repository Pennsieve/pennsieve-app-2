<template>
  <bf-page
    class="search-concept"
    :class="[ simplified ? 'simplified' : '' ]"
    element-loading-background="transparent"
  >
    <bf-rafter
      v-if="!simplified"
      slot="heading"
      :title="modelDisplayName"
    />

    <bf-stage slot="stage">
      <section
        v-show="showFilters && !simplified"
        class="filter"
      >
        <concept-query-builder
          ref="queryBuilder"
          :concept="concept"
          :concept-name="conceptName"
          :concepts="conceptsList"
          :is-files-proxy="isFilesProxy"
          @update-concept-search="handleUpdateConceptSearch"
        />
      </section>

      <section class="results-wrap">
        <div class="results">

          <concept-search-results
            :is-loading="resultsLoading"
            :concept-name="conceptName"
            :concept-id="conceptId"
            :property-count="propertyCount"
            :record-count="recordCount"
            :total-results="totalResults"
            :results="searchResults"
            :offset="offset"
            :sort-by="sortBy"
            :sort-direction="sortDirection"
            :non-sortable-columns="nonSortableColumns"
            @update-model-search-sort="handleUpdateSearchSort"
            @load-more-records="handleLoadMoreRecords"
          />
        </div>

      </section>
    </bf-stage>
  </bf-page>
</template>

<script>
import { mapGetters } from 'vuex'
import ConceptQueryBuilder from './ConceptQueryBuilder.vue'
import ConceptSearchResults from './ConceptSearchResults.vue'
import BfRafter from '../../../../components/shared/bf-rafter/BfRafter.vue'
import BfButton from '../../../../components/shared/bf-button/BfButton.vue'

import Request from '../../../../mixins/request'
import Sorter from '../../../../mixins/sorter'
import Logger from '../../../../mixins/logger'
import { propOr, pathOr, find, propEq, defaultTo, uniqBy, sortBy, has, prop, pluck, head, path, insert, pathEq } from 'ramda'
import stripPrefix from '../../../../utils/stripPrefix';

export default {
  name: 'ConceptSearch',

  components: {
    BfRafter,
    BfButton,
    ConceptQueryBuilder,
    ConceptSearchResults,
  },

  mixins: [
    Request,
    Sorter,
    Logger,
  ],

  props: {
    simplified: {
      type: Boolean,
      default: false
    },
  },

  data() {
    return {
      resultsLoading: true,
      conceptsList: [],
      concept: {},
      showFilters: true,
      searchResults: [],
      totalResults: 0,
      proxyModel: {
        id: '',
        name: 'Files'
      },
      offset: 0,
      filterClassification: 1
    }
  },

  computed: {
    ...mapGetters([
      'concepts',
      'dataset',
      'config',
      'userToken',
      'filesProxyId',
      'hasFeature',
    ]),

    /**
     * Returns the concept name
     * @returns {String}
     */
    conceptName: function() {
      return propOr('', 'name', this.concept)
    },
    /**
     * Returns the concept id
     * @returns {String}
     */
    conceptId: function(){
      return propOr('', 'id', this.concept)
    },
    /**
     * Returns the number of records in that concept
     * @returns {Number}
     */
    recordCount: function(){
      return propOr(0, 'count', this.concept)
    },
    propertyCount: function(){
      return propOr(0, 'propertyCount', this.concept)
    },
    /**
     * Creates the GET url for topology
     * @returns {String}
     */
    getTopologyUrl: function() {
      if (!this.userToken) {
        return
      }

      const datasetId = this.getDatasetId(this.$route)
      const conceptId = this.getConceptId(this.$route)
      return `${this.config.conceptsUrl}/datasets/${datasetId}/concepts/${conceptId}/topology`
    },

    /**
     * Determines if file proxy
     */
    isFilesProxy: function() {
      const conceptId = this.getConceptId(this.$route)
      const isFilesProxy = this.filesProxyId === conceptId

      if (isFilesProxy) {
        this.concept = Object.assign({}, this.proxyModel, { id: this.filesProxyId })
      }

      return isFilesProxy
    },

    /**
     * Get the model's display name
     */
    modelDisplayName: function() {
      if (!this.concept) {
        return
      }
      return propOr('Files', 'displayName', this.concept)
    },

    nonSortableColumns: function() {
      // check for array types
      if (this.searchResults.length) {
        const columns = pathOr([], [0, 'values'], this.searchResults)
        const arrayTypes = columns.filter(pathEq(['dataType', 'type'], 'array'))
        return arrayTypes.map(prop('name'))
      }
    }
  },

  // needed for direct load
  watch: {

    concepts: {
      handler: function(concepts) {
        if (concepts) {
          this.getConcept()
        }
      },
      immediate: true
    }
  },

  methods: {

    /**
     * Retrieves the concept topology based on dataset and concept ids
     */
    getTopology: function() {
      const url = this.getTopologyUrl
      if (!url) {
        return
      }
      this.sendXhr(url, {
          header: {
            'Authorization': `bearer ${this.userToken}`
          }
        })
        .then(resp => {
          if (!this.concept) {
            return
          }
          resp.push(this.concept)
          // de-dupe response to ensure only unique names are displayed
          const uniqueResponse = uniqBy(prop('name'), resp)
          const topology = uniqueResponse.map(concept => {
            return {
              id: concept.id,
              name: concept.name,
              displayName: concept.displayName,
              value: concept.id,
            }
          })
          const sortedList = sortBy(prop('displayName'), topology)
          this.conceptsList = sortedList
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Get dataset id from route params
     * @param {Object}
     * @returns {String}
     */
    getDatasetId: pathOr('', ['params', 'datasetId']),

    /**
     * Get concept id from route params
     * @param {Object}
     * @returns {String}
     */
    getConceptId: pathOr('', ['params', 'conceptId']),

    /**
     * Gets the concept data based on the route param
     */
    getConcept: function() {
      const conceptId = this.getConceptId(this.$route)
      const data = find(propEq('id', conceptId), this.concepts)
      this.concept = defaultTo({}, data)
      this.getTopology()
    },

    /**
     * Creates search url for search query or count
     * @param {String} suffix
     * @returns {String}
     */
    createSearchUrl: function(suffix) {
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      if (!this.userToken || !datasetId) {
        return
      }
      return `${this.config.conceptsUrl}/datasets/${datasetId}/query/${suffix}`
    },

    /**
     * Returns search count for query
     * @param {Object} query
     */
    getSearchCount: function(query) {
      const url = this.createSearchUrl('count')
      if (!url || this.offset > 0) {
        return
      }
      this.sendXhr(url, {
        header: {
          'Authorization': `bearer ${this.userToken}`
        },
        method: 'POST',
        body: query
      })
        .then(resp => this.totalResults = resp)
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Updates local component data
     * @param {Object} query
     */
    updateLocalData: function(query) {
      this.offset = propOr(0, 'offset', query)
      const orderBy = propOr({}, 'orderBy', query)

      const sortDirStr = has('Ascending', orderBy) ? 'Ascending' : 'Descending'
      const updatedSortBy = pathOr('createdAt', [sortDirStr, 'field'], orderBy)

      this.sortBy = stripPrefix(updatedSortBy)
      this.sortDirection = sortDirStr === 'Ascending' ? 'asc' : 'desc'
    },

    /**
     * Handles update-concept-search
     * @param {Object} query
     */
    handleUpdateConceptSearch: function(query) {
      this.resultsLoading = true

      const searchUrl = this.createSearchUrl('run')
      if (!searchUrl) {
        return
      }

      // update component local data
      this.updateLocalData(query)

      // get search count
      if (this.offset === 0) {
        // this.getSearchCount(query, searchUrl)
        this.searchResults = []
        this.totalResults = 0
      }

      this.sendXhr(searchUrl, {
        header: {
          'Authorization': `bearer ${this.userToken}`
        },
        method: 'POST',
        body: query
      })
        .then(resp => {
          this.searchResults = Array.isArray(resp) ? this.transformSearchResults(resp) : this.searchResults
          this.totalResults = this.searchResults.length // temporary until search count endpoint is live
          this.resultsLoading = false
        })
        .catch(err => {
          this.resultsLoading = false
          const txt = propOr(err, 'statusText', err)
          this.logger(['Error', txt], 'error')
        })
    },

    /**
     * Transform search results to account for related models
     * @param {Array} resp
     * @returns {Array}
     */
    transformSearchResults: function(resp) {
      const firstRecord = defaultTo({}, head(resp))

      if (Object.keys(firstRecord).length > 1) {
        return resp.map(item => {
          const record = prop('targetValue', item)
          const siteValues = path(['site', 'values'], item)

          // Get model title of the site
          let siteModelTitle = find(propEq('conceptTitle', true), siteValues)

          // Convert model title property to not be model title, so it doesn't interfere with the participant record
          siteModelTitle.conceptTitle = false
          siteModelTitle.displayName = 'Site'

          // Insert site model title into participant's values to be iterated over and displayed as a column
          const newValues = insert(1, siteModelTitle, record.values)
          record.values = newValues

          return record
        })
      } else {
        return pluck('targetValue', resp)
      }
    },

    /**
     * Handle update search sort from ConceptSearchResults
     * and invoke method on QueryBuilder
     * @param {Object} e
     */
    handleUpdateSearchSort: function(e) {
      this.$refs.queryBuilder.handleUpdateSearchSort(e)
    },

    /**
     * Handle load more records from ConceptSearchResults
     * and invoke method on QueryBuilder
     * @param {Object} e
     */
    handleLoadMoreRecords: function(e) {
      this.$refs.queryBuilder.handleLoadMoreRecords(e)
    }

  }
}
</script>

<style lang="scss" scoped>
.search-concept {
  background: #fff;
}

h2 {
  font-size:20px;
  font-weight: 600;
  line-height: 24px;
  margin: 0 0 16px;
}

.filter {
  margin-bottom: 32px;

  h2 {
    margin-bottom: 16px;
  }
}

#search-filters {
  margin-left: 42px;
  width: 256px
}
.simplified {
  .results-wrap {
    display: flex;
  }
  .results {
    flex: 1;
    overflow: hidden;
  }
}
</style>
