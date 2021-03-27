<template>
  <div class="search-results">
    <div v-loading="isLoadingRecords || isLoadingFiles">
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
                v-if="selectedButton === 'Records' && showDownloadResults"
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
          <files-table
            v-if="selectedButton === 'Files'"
            class="search-results-files-table"
            :data="fileResults"
            :multiple-selected="multipleSelected"
            :search-all-data-menu="true"
            :is-search-results="true"
            :non-sortable-columns="['content.name', 'subtype', 'storage', 'content.createdAt', 'datasetName']"
            @selection-change="setSelectedFiles"
            @click-file-label="onClickLabel"
          />
          <records-table
            v-if="selectedButton === 'Records'"
            class="search-results-records-table"
            :data="recordResults"
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
import { pathOr, propOr, find, propEq, compose, pluck } from 'ramda'
import { mapGetters, mapState, mapActions } from 'vuex'
import Cookies from 'js-cookie'

import FilesTable from '@/components/FilesTable/FilesTable.vue'
import RecordsTable from './RecordsTable/RecordsTable.vue'
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
const getQuery = (searchCriteria) => {
  const searchFilters = []
  const model = propOr('', 'model', searchCriteria)
  const filters = propOr([], 'filters', searchCriteria)
  const datasets = propOr([], 'datasets', searchCriteria)
  let query = {
    model: model,
    datasets
  }
  filters.forEach(filter => {
    const type = propOr('', 'type', filter)
    if (type === 'dataset') {
      // make dataset endpoint call here
      const datasetIntId = propOr('', 'targetIntId', filter)
      query.datasets.push(datasetIntId)
    } else {
      /**
       * Only add filter if the target exists
       * This is to allow searches with empty filters
       * We're counting on the validation steps before
       * this to ensure the filters are complete
       */
      if (filter.target && !filter.isInvalid) {
        searchFilters.push({
          model: filter.target,
          property: filter.property,
          operator: filter.operation,
          value: filter.value
        })
      }
    }
  })
  query.filters = searchFilters

  return query
}

const toQueryParams = (params) => Object.keys(params).map(key => key + '=' + params[key]).join('&');
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
const getRecordsV1Heading = (response) => {
  return response.length
    ? response[0].values.map(value => {
        return {
          modelTitle: value.conceptTitle,
          name: value.name,
          displayName: value.displayName
        }
      })
    : []
}

export default {
  name: 'SearchResults',

  components: {
    FilesTable,
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
        return {}
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
    }
  },

  data() {
    return {
      fileResults: [],
      recordResults: [],
      recordHeadings: [],
      selectedButton: 'Records',
      selectedFiles: [],
      tableResultsTotalCount: 0,
      datasetId: '',
      datasetName: '',
      isLoadingRecords: false,
      isLoadingFiles: false,
      recordDownloadQuery: {}
    }
  },

  computed: {
    ...mapGetters(['getModelById']),

    ...mapState(['config', 'userToken', 'activeOrganization']),

    /**
     * Compute active organization int ID
     * @returns {String}
     */
    activeOrgIntId: function() {
      return pathOr('', ['organization', 'intId'], this.activeOrganization)
    },

    /**
     * Gets files url
     * @returns {String}
     */
    getFilesUrl: function() {
      const params = compose(
        toQueryParams
      )(this.tableSearchParams)

      return `${this.config.apiUrl}/models/v2/organizations/${this.activeOrgIntId}/search/packages?${params}`
    },

    /**
     * Get records url
     * @returns {String}
     */
    getRecordsUrl: function() {
      const params = compose(
        toQueryParams
      )(this.tableSearchParams)

      return `${this.config.apiUrl}/models/v2/organizations/${this.activeOrgIntId}/search/records?${params}`
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
      return this.fileResults.length === 0 && this.recordResults.length === 0
    },

    /**
     * Indicates that there are no record search results
     * @returns {Boolean}
     */
    isRecordsButtonDisabled: function() {
      return this.recordResults.length === 0 ? true : false
    },

    /**
     * Indicates that there are no files search results
     * @returns {Boolean}
     */
    isFilesButtonDisabled: function() {
      return this.fileResults.length === 0 ? true : false
    },

    /**
     * Compute if the no results found state should be shown
     * @returns {Boolean}
     */
    showNoResultsState: function() {
      return this.noResultsFound
        && this.isLoadingRecords === false
        && this.isLoadingFiles === false
    },

    /**
     * Compute if the results state should be shown
     * @returns {Boolean}
     */
    showResultsState: function() {
      return this.noResultsFound === false
        && this.isLoadingRecords === false
        && this.isLoadingFiles === false
    }
  },

  watch: {
     /**
     * Watch if no records results to change radio button name
     * to files
     */
    isRecordsButtonDisabled: {
      handler: function(val) {
        if (val) {
          this.selectedButton = 'Files'
        } else {
          this.selectedButton = 'Records'
        }

        this.$emit('disable-records-button', val)
      },
      immediate: true
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
    }
  },

  methods: {
    ...mapActions([
      'updateSearchModalVisible'
    ]),

    /**
     * Fetches record search results
     */
    fetchRecords: function() {
      this.isLoadingRecords = true

      const query = getQuery(this.searchCriteria)
      const userToken = this.userToken || Cookies.get('user_token')

      this.sendXhr(this.getRecordsUrl, {
         method: 'POST',
         header: {
            'Authorization': `Bearer ${userToken}`
          },
         body: query
      })
        .then(this.handleRecordsResponse.bind(this))
        .catch(response => {
          this.handleXhrError(response)
        })
        .finally(() => {
          this.isLoadingRecords = false
        })
    },

    /**
     * Fetches record search results
     */
    fetchRecordsV1: function() {
      this.isLoadingRecords = true

      const userToken = this.userToken || Cookies.get('user_token')

      const params = getRecordsV1Params({ ...this.tableSearchParams, api_key: userToken }, this.isRecordsSortable)

      const url = `${this.config.apiUrl}/models/datasets/${this.$route.params.datasetId}/concepts/${this.$route.params.conceptId}/instances?${params}`

      this.sendXhr(url)
        .then(response => {
          this.handleRecordsResponseV1(response)
        })
        .catch(response => {
          this.handleXhrError(response)
        })
        .finally(() => {
          this.isLoadingRecords = false
        })
    },

    /**
     * Handle records response from v1 version of the API
     * @param {Array} response
     */
    handleRecordsResponseV1: async function(response) {
      this.recordDownloadQuery = getQuery(this.searchCriteria)

      /* Get the total record count for a model since
      * it is not returned from the endpoint
      */
      const { count } = await this.getModelById(this.$route.params.conceptId) || {}
      this.tableResultsTotalCount = count

      this.recordHeadings = getRecordsV1Heading(response)

      /**
       * Transform the response to match the shape
       * expected from the component and v2
       */
      const recordResults = response.map(record => {
        const formattedValues = Object.fromEntries(
          record.values.map(property => {
            // debugger
            const dataType = typeof property.dataType === 'object'
              ? property.dataType
              : { type: property.dataType }
            const formatter = getFormatter( dataType )

            const formattedValue = Array.isArray(property.value)
              ? property.value.map(v => formatter(v)).join(", ")
              : formatter(property.value)

            return [ property.name, formattedValue ]
          })
        )

        return {
          recordId: record.id,
          datasetId: this.$route.params.datasetId,
          modelId: this.$route.params.conceptId,
          ...formattedValues
        }
      })

      this.recordResults = recordResults
    },

    /**
     * Handles response from records search endpoint
     * @param {Object} response
     */
    handleRecordsResponse: function(response) {
      this.recordDownloadQuery = getQuery(this.searchCriteria)
      this.tableResultsTotalCount = response.totalCount
      this.recordHeadings = this.showDatasetColumn
        ? [{
            displayName: 'Dataset',
            name: 'dataset',
            dataType: {
              format: null,
              type: 'String'
            }
          }]
        : []
      this.recordResults = []
      const recordModels = propOr([], 'models', response)
      const records = propOr([], 'records', response)

      /**
       * a nested map of Model ID -> Property Name -> Data Type
       * for example:
       * {
       *   <some-model-uuid>: {
       *      name: {
       *        format: ...,
       *        type: ...
       *      },
       *      was_good: {
       *        format: ...,
       *        type: ...
       *      }
       *   },
       *   <another-model-uuid>: { ... }
       * }
       */
      const modelPropertyDataTypeMap = recordModels.reduce(
        (modelPropertyMapResult, model) => {
          modelPropertyMapResult[model.id] = model.properties.reduce(
            (propertyDtMapResult, property) => {
              const { dataType, name } = property;
              if (name) {
                propertyDtMapResult[name] = dataType
                // @todo: mutating this.recordHeadings in the reduce is yucky.  Probably better to just loop separately.
                const nameExists = this.recordHeadings.find(h => h.name === name)
                if (!nameExists) this.recordHeadings.push(property)
              }
              return propertyDtMapResult
            },
            {}
          )
          return modelPropertyMapResult
        },
        {}
      )

      // now to get record data
      const recordResults = records.map(record => {
        const values = propOr('', 'values', record)
        const recordId = propOr('', 'id', record)
        const modelObj = find(propEq('id', record.modelId), recordModels)

        const datasetNodeId = pathOr('', ['dataset', 'node_id'], modelObj)
        const datasetIntId = pathOr('', ['dataset', 'id'], modelObj)
        const datasetName = compose(
          propOr('', 'name'),
          find(propEq('intId', datasetIntId)),
          pluck('content')
        )(this.datasetList)

        /**
         * Format the values of the record
         */
        const formattedValues = Object.fromEntries(
          Object.entries(values).map(([key, value]) => {
            const dataType = modelPropertyDataTypeMap[record.modelId][key]
            const formatter = getFormatter( dataType )

            const formattedValue = Array.isArray(value)
              ? value.map(v => formatter(v)).join(", ")
              : formatter(value)

            return [key, formattedValue]
          })
        )

        return {
          dataset: datasetName,
          recordId: recordId,
          datasetId: datasetNodeId,
          modelId: record.modelId,
          ...formattedValues
        }
      })

      this.recordResults = recordResults
    },

    /**
     * Fetches file search results
     *
     */
    fetchFiles: function() {
      if (!this.getFilesUrl) {
        return
      }

      const query = getQuery(this.searchCriteria)
      const userToken = this.userToken || Cookies.get('user_token')

      this.sendXhr(this.getFilesUrl, {
         method: 'POST',
         header: {
            'Authorization': `Bearer ${userToken}`
          },
         body: query
      })
        .then(response => {
          this.tableResultsTotalCount = response.totalCount
          this.fileResults = response.packages.map(file => {
            if (!file.storage) {
              file.storage = 0
            }
            file.icon =
              file.icon || this.getFilePropertyVal(file.properties, 'icon')
            file.subtype = this.getSubType(file)
            const datasetId = pathOr('', ['content', 'datasetId'], file)
            const datasetName = compose(
              propOr('', 'name'),
              find(propEq('intId', datasetId)),
              pluck('content')
            )(this.datasetList)
            // to get the dataset name for this table
            file.datasetName = datasetName

            return file
          })
        })
        .catch(response => {
          this.handleXhrError(response)
        })
        .finally(() => {
          this.isLoadingFiles = false
        })
    },

    downloadRecordCsv: function() {
      EventBus.$emit('trigger-record-csv-download', this.recordDownloadQuery)
    },

    /**
     * Updates file search limit based on pagination selection
     * @param {Nunber} limit
     */
    updateTableSearchLimit: function(limit) {
      this.tableSearchParams.limit = limit
      if (this.selectedButton === 'Files') {
        this.fetchFiles()
      } else {
        if (this.searchCriteria.filters.length === 0) {
          this.fetchRecordsV1()
        } else {
          this.fetchRecords()
        }
      }
    },

    /**
     * Update pagination offset
     */
    onPaginationPageChange: function(page) {
      const offset = (page - 1) * this.tableSearchParams.limit
      this.tableSearchParams.offset = offset
      if (this.selectedButton === 'Files') {
        this.fetchFiles()
      } else {
        if (this.searchCriteria.filters.length === 0) {
          this.fetchRecordsV1()
        } else {
          this.fetchRecords()
        }
      }
    },

    /**
     * Set subtype of file, defaulting to package type
     * @param {Object} file
     * @returns {String}
     */
    getSubType: function(file) {
      const subtype = this.getFilePropertyVal(file.properties, 'subtype')

      let defaultType = ''
      const packageType = pathOr('', ['content', 'packageType'], file)
      switch (packageType) {
        case 'Collection':
          defaultType = 'Folder'
          break
        case 'ExternalFile':
          defaultType = 'External File'
          break
        default:
          break
      }

      return subtype ? subtype : defaultType
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
     * Navigate to file
     * @param {String} id
     */
    navigateToFile: function(id) {
      this.$router.push({ name: 'collection-files', params: { fileId: id } })
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
@import '../../../assets/_variables.scss';

h3 {
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 0.5px;
  color: $myelin;
}

.no-results-container {
  p {
    font-size: 13px;
    font-weight: normal;
    letter-spacing: 0.44px;
    line-height: 32px;
    color: $glial;
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
    color: $glial;
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
    color: $myelin;
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
  color: $glial;
  font-weight: 500;
}

/deep/ .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background-color: $midnight-blue;
  border-color: $midnight-blue;
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
