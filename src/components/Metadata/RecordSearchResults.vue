<template>
  <div class="search-results">
    <div v-loading="isLoadingRecords">
      <div
        v-if="showNoResultsState"
        class="no-results-container"
      >
        <h3>No results found</h3>
        <p>{{ emptyStateCopy }}</p>
      </div>
      <div
        v-if="showResultsState"
        class="results-container"
      >
        <div
          v-if="showControls"
          class="results-toggle"
        >
          <p>View</p>
          <el-radio-group
            v-model="selectedButton"
            size="medium"
          >
            <el-radio-button
              class="records-radio-button"
              label="Records"
              :disabled="isRecordsButtonDisabled"
            />
            <el-radio-button
              class="files-radio-button"
              label="Files"
              :disabled="isFilesButtonDisabled"
            />
          </el-radio-group>
        </div>
        <div class="results-table">
          <div class="file-pagination">
            <div>
              <pagination-page-menu
                class="mr-24"
                pagination-item-label="Results"
                :page-size="tableSearchParams.limit"
                @update-page-size="updateTableSearchLimit"
              />
              <button
                v-if= "showDownloadResults"
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
              :page-size="tableSearchParams.limit"
              :pager-count="5"
              :current-page="curFileSearchPage"
              layout="prev, pager, next"
              :total="tableResultsTotalCount"
              @current-change="onPaginationPageChange"
            />
          </div>
          <records-table
            class="search-results-records-table"
            :data="mappedResult"
            :headings="recordHeadings"
            :show-menu-column="showMenuColumn"
            :search-all-data-menu="true"
            :search-all-data-records="true"
            :is-sortable="isRecordsSortable"
            :table-search-params="tableSearchParams"
            @navigate-to-record="navigateToRecord"
            @sort="$emit('sort', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { pathOr, propOr} from 'ramda'
import { mapGetters, mapState, mapActions } from 'vuex'

import RecordsTable from '../SearchAllData/SearchResults/RecordsTable/RecordsTable.vue'
import PaginationPageMenu from '@/components/shared/PaginationPageMenu/PaginationPageMenu.vue'

import GetFileProperty from '@/mixins/get-file-property'
import Request from '@/mixins/request/index'
import FormatDate from '@/mixins/format-date'
import EventBus from '@/utils/event-bus'
import { getFormatter } from '@/mixins/data-type/utils';

/**
 * Compute query from searchCriteria
 * @param {Object} searchCriteria
 * @returns {Object}
 */

const conceptId = '00000000-0000-0000-0000-000000000000'

/**
 * Get params for v1 of records
 * This endpoint will error if sending `orderBy` and `orderDirection`
 * keys if total records are over a certain number
 * @param {Object} params
 * @param {Boolean} isRecordsSortable
 * @returns {Object}
 */
const getRecordsV1Params = (params, isRecordsSortable) => {
  const { limit, offset, api_key } = params

  return isRecordsSortable
    ? toQueryParams(params)
    : toQueryParams({
      limit,
      offset,
      api_key
    })
}

/**
 * Get the headings for the records, if there are results
 * @param {Array}
 * @returns {Array}
 */
const getRecordsHeading = (props) => {
  return props
    ? props.map(value => {
      return {
        dataType: {
          format: null,
          type: value.dataType
        },
        name: value.name,
        displayName: value.displayName,
        modelTitle: value.conceptTitle
      }
    })
    : []
}

export default {
  name: 'RecordSearchResults',

  components: {
    RecordsTable,
    PaginationPageMenu
  },

  mixins: [GetFileProperty, Request, FormatDate],

  props: {
    searchCriteria: {
      type: Object,
      default: () => {
        return {}
      }
    },
    showSearchResults: {
      type: Boolean,
      default: false
    },
    tableSearchParams: {
      type: Object,
      default: () => {
        return {
          ascending:false,
          limit:25,
          offset:0,
          orderBy:null,
          orderDirection:"asc"

        }
      }
    },
    datasetList: {
      type: Array,
      default: () => {
        return []
      }
    },
    showControls: {
      type: Boolean,
      default: true
    },
    showDatasetColumn: {
      type: Boolean,
      default: true
    },
    showMenuColumn: {
      type: Boolean,
      default: true
    },
    showDownloadResults: {
      type: Boolean,
      default: true
    },
    emptyStateCopy: {
      type: String,
      default: 'Try a different combination of filters or search within all datasets'
    },
    isRecordsSortable: {
      type: Boolean,
      default: false
    },
    model: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      recordResults: [],
      recordHeadings: ['externalparticipantid'],
      selectedButton: 'Records',
      selectedFiles: [],
      tableResultsTotalCount: 0,
      datasetId: '',
      datasetName: '',
      isLoadingRecords: false,
      recordDownloadQuery: {},
      mappedResult: []
    }
  },

  mounted: function() {

    // Subscribe to changes to the records of the model.
    this.unsubscribe = this.$store.subscribe((mutation) => {
      let needsUpdate = mutation.type == 'metadataModule/SET_RECORDS_FOR_MODEL'
      let needsUpdateModelProps = mutation.type == 'metadataModule/SET_PROPS_FOR_MODEL'
      if (mutation.payload && needsUpdate) {

        this.recordResults = mutation.payload.result.records
        this.tableResultsTotalCount = mutation.payload.result.total

        let result = []
        if (this.recordResults) {
          result = this.recordResults.map(record => {
            return {
              recordId: record.id,
              datasetId: this.$route.params.datasetId,
              modelId: this.model.id,
              ...record.props
            }
          })
          this.mappedResult = result

        } else {
          this.mappedResult = []
        }
      } else if (mutation.payload && needsUpdateModelProps) {
        if (this.model.name == mutation.payload.model) {
          this.recordHeadings =getRecordsHeading(mutation.payload.props)
        }
      }
    })

    if (this.model.name != '') {
      this.fetchRecords( {
        modelName: this.model.name,
        limit: this.tableSearchParams.limit,
        offset:this.tableSearchParams.offset
      })

      if (this.model.props) {
        this.recordHeadings = getRecordsHeading(this.model.props)
      }
    }
  },
  beforeDestroy: function() {
    this.unsubscribe()
  },

  computed: {
    ...mapGetters(['getModelById']),

    ...mapState(['config', 'userToken', 'activeOrganization', 'dataset', 'concepts']),

    ...mapState('metadataModule',[
      'filterParams','records', 'models'
    ]),
    ...mapGetters('metadataModule',[
      'getRecordsByModel',
    ]),

    /**
     * Compute active organization int ID
     * @returns {String}
     */
    activeOrgIntId: function() {
      return pathOr('', ['organization', 'intId'], this.activeOrganization)
    },


    /**
     * Returns the current page postion for files table in pagination ticker
     * @returns {Number}
     */
    curFileSearchPage: function() {
      return this.tableSearchParams.offset / this.tableSearchParams.limit + 1
    },

    /**
     * Compute if multiple files are selected
     * @returns {Boolean}
     */
    multipleSelected: function() {
      return this.selectedFiles.length > 1
    },

    /**
     * Indicates that no search results were found
     * @returns {Boolean}
     */
    noResultsFound: function() {
      return this.mappedResult.length === 0
    },

    /**
     * Indicates that there are no record search results
     * @returns {Boolean}
     */
    isRecordsButtonDisabled: function() {
      return this.recordResults.length === 0 ? true : false
    },

    /**
     * Compute if the no results found state should be shown
     * @returns {Boolean}
     */
    showNoResultsState: function() {
      return this.noResultsFound
        && this.isLoadingRecords === false
    },

    /**
     * Compute if the results state should be shown
     * @returns {Boolean}
     */
    showResultsState: function() {
      return this.noResultsFound === false
        && this.isLoadingRecords === false
    }
  },

  watch: {
    model: {
      handler: function(ev) {
        this.recordHeadings = getRecordsHeading(this.model.props)
        this.fetchRecords( {
          modelName: this.model.name,
          limit: this.tableSearchParams.limit,
          offset:this.tableSearchParams.offset
        })
      }
    },

    /**
     * Watches for button change in order
     * to reset pagination
     */
    selectedButton: {
      handler: function(val) {
        if (val) {
          this.$emit('reset-search-params', val)
        }
      },
      immediate: true
    },

    filterParams: {
      deep: true,
      handler: function() {
        if (this.dataset.content) {
          this.fetchRecords( {
            modelName: this.model.name,
            limit: this.tableSearchParams.limit,
            offset:this.tableSearchParams.offset
          })
        }
      }
    },
  },

  methods: {
    ...mapActions([
      'updateSearchModalVisible'
    ]),

    ...mapActions('metadataModule', [
      'fetchRecords',
      'clearSelectedRecords',
      'fetchModels',
      'fetchModelProps'
    ]),

    downloadRecordCsv: function() {
      EventBus.$emit('trigger-record-csv-download', this.recordDownloadQuery)
    },

    /**
     * Updates file search limit based on pagination selection
     * @param {Nunber} limit
     */
    updateTableSearchLimit: function(limit) {
      this.tableSearchParams.limit = limit
      this.fetchRecords( {
        modelName: this.model.name,
        limit: this.tableSearchParams.limit,
        offset:this.tableSearchParams.offset
      })

    },

    /**
     * Update pagination offset
     */
    onPaginationPageChange: function(page) {
      const offset = (page - 1) * this.tableSearchParams.limit
      this.tableSearchParams.offset = offset
      this.fetchRecords( {
        modelName: this.model.name,
        limit: this.tableSearchParams.limit,
        offset:this.tableSearchParams.offset
      })

    },

    /**
     * Handler for clicking filea
     * @param {Object} file
     */
    onClickLabel: function(file) {
      const datasetId = pathOr('', ['content', 'datasetNodeId'], file)
      const packageType = pathOr('', ['content', 'packageType'], file)
      const id = pathOr('', ['content', 'nodeId'], file)

      if (id === '') {
        return
      }

      if (packageType === 'Collection') {
        this.navigateToFile(id)
      } else {
        this.$router.push({
          name: 'file-record',
          params: {
            instanceId: id,
            datasetId: datasetId,
            conceptId: conceptId
          }
        })
      }
      this.updateSearchModalVisible(false)
    },

    /**
     * Navigate to records details route
     * @param {Object} record
     */
    navigateToRecord: function(record) {
      const recordId = propOr('', 'recordId', record)
      const datasetId = propOr('', 'datasetId', record)
      const modelId = propOr('', 'modelId', record)

      this.$router.push({
        name: 'concept-instance',
        params: {
          instanceId: recordId,
          conceptId: modelId,
          datasetId: datasetId
        }
      })
      this.updateSearchModalVisible(false)
    },

    /**
     * Set selected files
     * @param {Array} selection
     */
    setSelectedFiles: function(selection) {
      this.selectedFiles = selection
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/_variables.scss';

h3 {
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 0.5px;
  color: $gray_6;
}

.no-results-container {
  p {
    font-size: 13px;
    font-weight: normal;
    letter-spacing: 0.44px;
    line-height: 32px;
    color: $gray_4;
    margin-top: -14px;
  }
}

.results-container {
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  p {
    font-size: 14px;
    font-weight: normal;
    letter-spacing: 0px;
    line-height: 0px;
    color: $gray_4;
    margin-right: 11px;
    margin-top: 7px;
  }
}

.results-toggle {
  display: inline-flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 21px;
}

.file-pagination {
  margin-bottom: 14px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  /deep/ .el-dropdown-text-link:not(:hover, :active) {
    color: $gray_6;
  }
}

.files-radio-button {
  /deep/ .el-radio-button__inner {
    width: 85px !important;
  }
}

.el-loading-parent--relative {
  min-height: 52px // Matches the no results state
}

/deep/ .el-radio-button__inner {
  height: 32px;
  padding-top: 8px;
  font-size: 14px;
  color: $gray_4;
  font-weight: 500;
}

/deep/ .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background-color: $purple_3;
  border-color: $purple_3;
  color: white;
}

/deep/ .el-radio-button__orig-radio:disabled + .el-radio-button__inner {
  color: $disabled-radio-button-text-color;
  border-color: $disabled-radio-button-border-color;
  background-color: $disabled-radio-button-background-color;
}

.download-icon {
  margin-top: -4px;
}
</style>
