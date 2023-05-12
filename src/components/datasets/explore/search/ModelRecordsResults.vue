<template>
  <div class="concept-search-results">
    <div class="results-table">
      <div class="record-pagination">
        <div>
          <pagination-page-menu
            class="mr-24"
            pagination-item-label="Results"
            :page-size="limit"
            @update-page-size="onUpdateLimit"
          />
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
        <el-pagination
          :page-size="limit"
          :pager-count="5"
          :current-page="offset / limit + 1"
          layout="prev, pager, next"
          :total="recordCount"
          @current-change="onPaginationPageChange"
        />
      </div>
      <el-table
        v-if="!(recordCount === 0 && !resultsLoading)"
        ref="table"
        :empty-text="resultsLoading ? 'Loading...' : 'No Data'"
        :data="formattedResults"
        width="100%"
        :border="true"
        @bf-sort="onUpdateSort"
        @select-all="onSelectAll"
      >
        <el-table-column
          v-if="hasMultiSelect"
          width="36"
          type="selection"
          :fixed="true"
        >
          <template slot-scope="scope">
            <el-checkbox
              :value="multiSelectIsSelected(scope, selectedItemIds)"
              @change="value => onSelectIndividual(value, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="hasRadioSelection"
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
            <template v-if="index === 0 && !scope.row[heading].value && scope.row[heading].value !== 0 && !hasRadioSelection && !hasMultiSelect">
              <router-link
                v-if="getPermission('editor')"
                :to="{
                  name: 'concept-instance',
                  query: {
                    name: heading
                  },
                  params: {
                    conceptId,
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
              v-if="index === 0 && !hasRadioSelection && !hasMultiSelect"
              :to="{name: 'concept-instance', params: { conceptId: $route.params.conceptId, instanceId: scope.row.recordId }}"
              v-html="displayValue(scope.row[heading])"
            />
            <span
              v-if="index > 0 || hasRadioSelection || hasMultiSelect"
              v-html="displayValue(scope.row[heading])"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <bf-empty-page-state
      v-if="recordCount === 0 && !resultsLoading"
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
        <bf-button
          v-if="getPermission('editor')"
          class="no-results-button"
          :disabled="datasetLocked"
        >
          Create a New Record
        </bf-button>
      </router-link>
      <router-link
        v-else
        :to="{
          name: 'models',
          params: {
            conceptId: conceptId
          },
          query: {
            open: 1
          }
        }"
      >
        <bf-button
          v-if="getPermission('editor')"
          class="no-results-button"
        >
          Add Properties
        </bf-button>
      </router-link>
    </bf-empty-page-state>

    <bf-empty-page-state
      v-if="searchResults.length === 0 && recordCount !== 0 && !resultsLoading"
      class="no-results"
    >
      <img
        src="/static/images/illustrations/illo-search.svg"
        alt=""
      >
      <h3>No Results found.</h3>
      <p>
        Try removing some filters or <router-link
          :to="{ name: 'records' }"
          class=""
        >
          browse
        </router-link> a different concept.
      </p>
    </bf-empty-page-state>

    <template>
      <div
        v-loading="resultsLoading"
        class="is-loading"
        element-loading-background="transparent"
      />
    </template>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import TableFunctions from '../../../../mixins/table-functions'
import FormatDate from '../../../../mixins/format-date'
import {defaultTo, find, head, path, propEq, propOr} from 'ramda'

import Logger from '@/mixins/logger'
import Request from '@/mixins/request'
import EncodeInternalFields from '@/mixins/encode-internal-fields'

import BfEmptyPageState from '../../../shared/bf-empty-page-state/BfEmptyPageState'
import BfButton from '../../../shared/bf-button/BfButton'

import EventBus from '../../../../utils/event-bus.js'
import PaginationPageMenu from "../../../shared/PaginationPageMenu/PaginationPageMenu";
import {Methods} from "../../../../typescript/lib/model-records/methods";
import {Computed} from "../../../../typescript/lib/model-records/computed";

export default {
  name: 'ModelRecordsResults',

  components: {
    BfEmptyPageState,
    BfButton,
    PaginationPageMenu
  },

  mixins: [
    TableFunctions,
    FormatDate,
    Logger,
    Request,
    EncodeInternalFields
  ],

  props: {
    concept: {
      type: Object,
      default: () => {}
    },
    defaultLimit: {
      type: Number,
      default: 50
    },
    hasRadioSelection: {
      type: Boolean,
      default: false
    },
    radioSelection: {
      type: String,
      default: ''
    },
    hasMultiSelect: {
      type: Boolean,
      default: false
    },
    selectedItemIds: {
      type: Set,
      default: () => new Set()
    }
  },

  data() {
    return {
      resultsLoading: true,
      displaySearchError: false,
      searchResults: [],
      formattedResults: [],
      sortedHeadings: [],
      proxyModel: {
        id: '',
        name: 'Files'
      },
      offset: 0,
      limit: this.defaultLimit,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      headings: [],
      localRadioSelection: ''
    }
  },

  computed: {
    ...mapGetters([
      'getPermission',
      'dataset',
      'config',
      'userToken',
      'filesProxyId',
      'hasFeature',
      'lastRoute',
      'datasetLocked'
    ]),

    datasetId: function() {
      return Computed.datasetId(this.$route)
    },

    conceptId: function() {
      return Computed.conceptId(this.concept)
    },

    /**
     * Returns the concept name
     * @returns {String}
     */
    conceptName: function() {
      return Computed.conceptName(this.concept)
    },

    /**
     * Returns the number of records in that concept
     * @returns {Number}
     */
    recordCount: function() {
      return Computed.recordCount(this.concept)
    },

    propertyCount: function() {
      return Computed.propertyCount(this.concept)
    },

    nonSortableColumns: function() {
      return Computed.nonSortableColumns(this.searchResults)
    },

    modelRecordsUrl: function() {
      return Computed.modelRecordsUrl(this)
    },
  },

  watch: {

    searchResults: function(searchResults) {
      if (!searchResults) {
        return
      }


      this.formattedResults = this.formatSearchResults(searchResults)
      this.sortedHeadings = this.getHeadings(searchResults, ['dataType', 'createdAt'])
      this.$emit('search-results-changed', searchResults)
    },

    /**
     * initialize and re-fetch records when concept changes
     */
    concept: {
      handler: function() {
        this.offset = 0;
        this.limit = this.defaultLimit;
        this.fetchRecords()
      },
      immediate: true,
    },

    radioSelection: {
      handler: function(val) {
        this.localRadioSelection = val
      },
      immediate: true
    },

    localRadioSelection: {
      handler: function(val) {
        this.$emit('radio-selection', val)
      }
    },

    selectedItemIds: {
      /**
       * make sure the select all checkbox doesn't get out of sync
       * @param items {Set}
       */
      handler: function(items) {
        if (this.$refs.table && items.size === 0) {
          this.$refs.table.clearSelection()
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Executes search query by applying filters
     */
    fetchRecords: function() {
      Methods.fetchRecords(this)
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
      const firstRow = defaultTo({}, head(this.searchResults))
      if (path(['content', 'name'], firstRow)) {
        return this.getFileName(displayName)
      }
      const values = propOr([], 'values', firstRow)
      if (values.length === 0) {
        return displayName
      }
      const propertyObj = find(propEq('displayName', displayName), values)
      const value = propOr('', 'name', propertyObj)
      if (displayName === 'Date Created') return 'createdAt'
      if (value){
        return value
      }
    },

    downloadRecordCsv: function() {
      EventBus.$emit('trigger-record-csv-download', { model: this.conceptName, datasets: [this.dataset.content.intId], filters: []})
    },

    multiSelectIsSelected: function(scope, selectedItemIds) {
      return selectedItemIds.has(scope.row.recordId)
    },

    onPaginationPageChange: function(page) {
      Methods.onPaginationPageChange(this, page)
    },

    onUpdateLimit: function(limit) {
      Methods.onUpdateLimit(this, limit)
    },

    onUpdateSort: function(sortBy) {
      Methods.onUpdateSort(this, sortBy)
    },

    onSelectAll: function(items) {
      this.$emit('select-all', items)
    },

    onSelectIndividual: function(value, item) {
      this.$emit('select-individual', value, item)
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

  .el-table--border /deep/ td {
    border-right: 1px solid transparent;
  }
}

.download-icon {
  margin-top: -4px;
}

.record-pagination {
  margin-bottom: 14px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  /deep/ .el-dropdown-text-link:not(:hover, :active) {
    color: $gray_6;
  }
}

.radio-selection {
  .el-radio__label {
    display: none !important;
  }
}
</style>
