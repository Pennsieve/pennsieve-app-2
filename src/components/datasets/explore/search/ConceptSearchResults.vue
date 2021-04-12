<template>
  <div class="concept-search-results">
    <div
      v-if="searchResults.length > 0"
      class="results-table"
    >
      <div
        v-if="!hideHeading"
        class="heading"
      >
        <h2>Results</h2>
        <!-- <div class="results-count">{{totalResults}} Results</div> -->
        <button
          class="dataset-filter-dropdown el-dropdown-link"
          @click="downloadRecordCsv"
        >
          <span class="el-dropdown-text-link">
            Download Results
          </span>
          <svg-icon
            class="ml-8 download-icon"
            name="direct-download"
            height="20"
            width="20"
          />
        </button>
      </div>
      <el-table
        :data="searchResults"
        width="100%"
        :height="tableHeight"
        :border="true"
        @bf-sort="onTableSort"
        @selection-change="trackSelectionChange"
        @row-click="onRowClick"
      >
        <el-table-column
          v-if="showSelection"
          width="36"
          type="selection"
          :fixed="true"
        />
        <el-table-column
          v-if="showRadioSelection"
          width="36"
          :fixed="true"
        >
          <template slot-scope="scope">
            <el-radio
              v-model="localRadioSelection"
              class="radio-selection"
              :label="scope.row.recordId"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-for="(heading, index) in sortedHeadings"
          :key="heading"
          :item="heading"
          :prop="getProperty(heading)"
          :label="heading"
          :fixed="index === 0"
          min-width="200"
          :render-header="renderHeader"
          :resizable="true"
        >
          <template slot-scope="scope">
            <template v-if="index === 0 && !showSelection && !scope.row[heading].value && scope.row[heading].value !== 0">
              <router-link
                v-if="getPermission('editor')"
                :to="{
                  name: 'concept-instance',
                  query: {
                    name: heading
                  },
                  params: {
                    conceptId: $route.params.conceptId,
                    instanceId: scope.row.recordId
                  }
                }"
              >
                Add a Value
              </router-link>
              <router-link
                v-else
                :to="{
                  name: 'concept-instance',
                  params: {
                    instanceId: scope.row.recordId
                  }
                }"
              >
                Untitled Record
              </router-link>
            </template>
            <router-link
              v-if="index === 0 && !showSelection && !showRadioSelection"
              :to="{name: 'concept-instance', params: { conceptId: $route.params.conceptId, instanceId: scope.row.recordId }}"
              v-html="displayValue(scope.row[heading])"
            />
            <span
              v-if="index > 0 || showSelection || showRadioSelection"
              v-html="displayValue(scope.row[heading])"
            />
          </template>
        </el-table-column>
      </el-table>

      <a
        v-if="showLoadMore"
        href="#loadMoreResults"
        class="load-more"
        @click="loadMoreResults"
      >
        Load More
      </a>
    </div>

    <bf-empty-page-state
      v-if="recordCount === 0 && !isLoading"
      class="no-results"
    >
      <img
        src="/static/images/illustrations/illo-search.svg"
        alt=""
      >
      <h3>There are no Records for {{ conceptName }}.</h3>
      <p v-if="propertyCount === 0">
        Before you can create a record, you'll need to add some properties to this model.
      </p>
      <router-link
        v-if="propertyCount > 0"
        :to="{
          name: 'concept-instance',
          params: {
            conceptId: conceptId,
            instanceId: 'new'
          }
        }"
      >
        <bf-button class="no-results-button">
          Create a New Record
        </bf-button>
      </router-link>
      <router-link
        v-else
        :to="{
          name: 'concept-management',
          params: {
            conceptId: conceptId
          },
          query: {
            open: 1
          }
        }"
      >
        <bf-button class="no-results-button">
          Add Properties
        </bf-button>
      </router-link>
    </bf-empty-page-state>

    <bf-empty-page-state
      v-if="searchResults.length === 0 && recordCount !== 0 && !isLoading"
      class="no-results"
    >
      <img
        src="/static/images/illustrations/illo-search.svg"
        alt=""
      >
      <h3>No Results found.</h3>
      <p>
        Try removing some filters or <router-link
          :to="{ name: 'records-overview' }"
          class=""
        >
          browse
        </router-link> a different concept.
      </p>
    </bf-empty-page-state>

    <template v-if="showLoader">
      <div
        v-loading="isLoading"
        class="is-loading"
        element-loading-background="transparent"
      />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import TableFunctions from '../../../../mixins/table-functions'
import FormatDate from '../../../../mixins/format-date'
import { propOr, head, defaultTo, find, propEq, path } from 'ramda'

import BfEmptyPageState from '../../../shared/bf-empty-page-state/BfEmptyPageState'
import BfButton from '../../../shared/bf-button/BfButton'

import EventBus from '../../../../utils/event-bus.js'

export default {
  name: 'ConceptSearchResults',

  components: {
    BfEmptyPageState,
    BfButton
  },

  mixins: [
    TableFunctions,
    FormatDate,
  ],

  props: {
    results: {
      type: Array,
      default: () => []
    },
    tableHeight: {
      type: Number,
      default: 0
    },
    conceptName: {
      type: String,
      default: ''
    },
    conceptId: {
      type: String,
      default: ''
    },
    recordCount: {
      type: Number,
      default: 0
    },
    propertyCount: {
      type: Number,
      default: 0
    },
    isLoading: {
      type: Boolean,
      default: true
    },
    totalResults: {
      type: Number,
      default: 0
    },
    hideHeading: {
      type: Boolean,
      value: false
    },
    showSelection: {
      type: Boolean,
      value: false
    },
    offset: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: 50
    },
    sortBy: {
      type: String,
      default: 'createdAt'
    },
    sortDirection: {
      type: String,
      default: 'desc'
    },
    nonSortableColumns: {
      type: Array,
      default: function() {
        return []
      }
    },
    showLoader: {
      type: Boolean,
      default: false
    },
    showRadioSelection: {
      type: Boolean,
      default: false
    },
    radioSelection: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      searchResults: [],
      headings: [],
      localRadioSelection: ''
    }
  },

  computed: {
    ...mapGetters([
      'getPermission'
    ]),

    ...mapState(['dataset']),

    /**
     * Returns sorted keys
     * @returns {Array}
     */
    sortedHeadings: function() {
      if (this.results.length === 0) {
        return this.headings
      }
      const headingsList = this.getHeadings(this.results, ['dataType'])
      const firstHeading = head(headingsList)
      this.headings = headingsList
      return headingsList
    },
    /**
     * Returns boolean to determine when to show load more link
     * @returns {Boolean}
     */
    showLoadMore: function() {
      // return this.offset + this.limit < this.totalResults
      return this.results.length === this.limit // temporary until search count endpoint is live
    }
  },

  watch: {
    results: function(results) {
      if (!results) {
        return
      }
      // reset search results
      if (this.offset === 0) {
        this.searchResults = []
      }
      this.searchResults = this.searchResults.concat(this.formatSearchResults(results))
    },

    radioSelection: {
      handler: function(val) {
        this.localRadioSelection = val
      }
    }
  },

  methods: {
    /**
     * Captures selection-change event and emits table-selection-change event to parent component
     * @param {Array} list
     */
    trackSelectionChange: function(list) {
      this.$emit('table-selection-change', list)
    },

    /**
     * Increments offset and reruns search query
     */
    loadMoreResults: function(evt) {
      evt.preventDefault()
      this.$emit('load-more-records')
    },

    /**
     * Handle bf-sort event
     */
    onTableSort: function(property) {
      this.$emit('update-model-search-sort', property)
    },

    /**
     * Gets file name key given a displayName
     * @param {String} displayName
     * @returns {String}
     */
    getFileName: function(displayName) {
      switch (displayName) {
        case 'Date Created':
          return 'createdAt'
        case 'Size':
          return 'storage'
        case 'Kind':
          return 'type'
        default:
          return 'name'
      }
    },

    /**
     * Gets the property name for the displayName
     * @param {String} displayName
     */
    getProperty: function(displayName) {
      const firstRow = defaultTo({}, head(this.results))
      if (path(['content', 'name'], firstRow)) {
        return this.getFileName(displayName)
      }
      const values = propOr([], 'values', firstRow)
      if (values.length === 0) {
        return displayName
      }
      const propertyObj = find(propEq('displayName', displayName), values)
      const value = propOr('', 'name', propertyObj)
      if (value){
        return value
      }
    },

    /**
     * Handle row click event
     */
    onRowClick: function(row, event, column) {
      if (this.showRadioSelection) {
        this.$emit('update:radioSelection', row.recordId)
        this.$emit('update-record-to', row)
      }
    },

    downloadRecordCsv: function() {
      EventBus.$emit('trigger-record-csv-download', { model: this.conceptName, datasets: [this.dataset.content.intId], filters: []})
    },
  }
}
</script>

<style lang="scss">
@import '../../../../assets/variables';

.concept-search-results {

  .is-loading {
    padding: 8px 0;
  }

  .load-more {
    display: inline-block;
    margin: 16px 0;
  }

  .heading {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 8px;

    h2 {
      font-size:20px;
      font-weight: 600;
      line-height: 24px;
      margin: 0;
      padding-right: 16px;
    }
  }

  .results-count {
    color: $gray_4;
    margin-right: 32px;
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h3 {
      margin: 20px 0 0;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      line-height: 16px;
      color: #000000;
    }

    p {
      color: $gray_4;
      font-size: 14px;
      line-height: 16px;
      margin: 6px 0;
      max-width: 576px;
      text-align: center;
    }

    img {
      height: 78px;
      width: 99px;
    }
  }

  .no-results-button{
    margin-top: 8px;
    height: 40px;
    width: 179px;
  }

  .radio-selection {
    .el-radio__label {
      display: none !important;
    }
  }

  .el-table--border /deep/ td {
    border-right: 1px solid transparent;
  }
}

.download-icon {
  margin-top: -4px;
}
</style>
