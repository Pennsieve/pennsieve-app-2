<template>
  <side-drawer
    :heading="title"
    :show-cancel-button="showCancelButton"
    :visible="visible"
    :heading-border="headingBorder"
    @close-side-drawer="closeSideDrawer"
  >
    <div slot="copy">
      You can attach files to this record by selecting from the files below.
    </div>
    These {{ numItems }} will be added as relationships to {{ conceptName }}.
    <div
      slot="body"
      class="full-width"
    >
      <template>
        <div class="table-nav-bar">
          <div class="table-nav-bar--breadcrumb">
            <breadcrumb-navigation
              :ancestors="ancestors"
              :file="file"
              :file-id="fileId"
              @navigate-breadcrumb="handleNavigateBreadcrumb"
            />
          </div>
          <div class="table-nav-bar--selected-count">
            {{ numItems }} selected
          </div>
        </div>
        <el-table
          v-if="files.length > 0"
          ref="Table"
          class="files-table"
          :data="files"
          @bf-sort="handleSortChange"
          @select="handleSelect"
          @select-all="handleTableSelectAll"
          @cell-mouse-enter="handleTableCellEnter"
          @cell-mouse-leave="handleTableCellLeave"
        >
          <el-table-column
            width="60"
            type="selection"
            fixed
          >
            <template slot-scope="scope">
              <el-checkbox
                v-if="showRowCheckbox(scope.store, scope.row, hoverRow) "
                :value="scope.store.isSelected(scope.row)"
                @input="scope.store.commit('rowSelectedChanged', scope.row)"
              />
              <img
                v-else
                class="svg-icon icon-item"
                :src="fileIcon(scope.row.icon, scope.row.content.packageType)"
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="content.name"
            label="Name"
            fixed
            min-width="175"
            sortable="custom"
            :render-header="renderHeader"
          >
            <template slot-scope="scope">
              <button
                v-if="scope.row.content.packageType === 'Collection'"
                @click.stop="getFiles(scope.row.content.id)"
              >
                {{ getPackageDisplayName(scope.row) }}
              </button>
              <span v-if="scope.row.content.packageType !== 'Collection'">
                {{ getPackageDisplayName(scope.row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="subtype"
            label="Kind"
            :render-header="renderHeader"
          />
          <el-table-column
            prop="content.createdAt"
            label="Date Created"
            :render-header="renderHeader"
            :formatter="dateCreatedFormatter"
            align="right"
          />
        </el-table>
      </template>
    </div>

    <div slot="buttons">
      <template>
        <bf-button
          class="secondary"
          @click="closeSideDrawer"
        >
          Cancel
        </bf-button>
        <bf-button
          :disabled="disableButton"
          @click="createRelationship"
        >
          Add Files
        </bf-button>
      </template>
    </div>
  </side-drawer>
</template>

<script>
import { mapGetters } from 'vuex'
import { defaultTo, propOr, pathOr, find, propEq, pathEq, uniq } from 'ramda'

import BreadcrumbNavigation from '../../files/BreadcrumbNavigation/BreadcrumbNavigation.vue'
import SideDrawer from '@/components/shared/side-drawer/SideDrawer.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'

import TableFunctions from '@/mixins/table-functions'
import Sorter from '@/mixins/sorter'
import Request from '@/mixins/request'
import StorageMetrics from '@/mixins/bf-storage-metrics/index'
import FileIcon from '@/mixins/file-icon/index'
import FormatDate from '@/mixins/format-date'

import EventBus from '@/utils/event-bus'
import { packageDisplayName } from '@/utils/packages'

export default {
  name: 'AddFileRelationshipDrawer',

  components: {
    SideDrawer,
    BfButton,
    BreadcrumbNavigation,
  },

  mixins: [
    TableFunctions,
    Sorter,
    Request,
    FileIcon,
    StorageMetrics,
    FormatDate,
  ],

  props: {
    relatedFiles: {
      type: Array,
      default: () => []
    },
    concept: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      hoverRow: {},
      title: 'Select Files/Folders',
      headingBorder: false,
      visible: false,
      showCancelButton: false,
      files: [],
      enableSelection: true,
      selectedItems: [],
      ancestors: [],
      file: {},
      fileId: null,
      isCreating: false
    }
  },

  computed: {
    ...mapGetters([
      'config',
      'userToken',
    ]),

    /**
     * Returns hard-coded concept name for files
     * @returns {Object}
     */
    relationship: function() {
      return {conceptName: 'Files'}
    },

    /**
     * Returns concept display name
     * @returns {Object}
     */
    conceptName: function() {
      return propOr('', 'displayName', this.concept)
    },

    /**
     * Returns number selected files
     * @returns {Number}
     */
    numItems: function() {
      const count = this.selectedItems.length
      const plural = count > 1 || count === 0 ? 's' : ''
      return `${count} item${plural}`
    },

    /**
     * Computes whether or not to disable next step
     * @returns {Boolean}
     */
    disableButton: function() {
      if (this.isCreating) {
        return true
      }
      return this.selectedItems.length === 0
    },

    /**
     * Detect if the model is a file
     * @returns {Boolean}
     */
    isFile: function() {
      const id = this.$route.params.instanceId
      return id.indexOf('package') >= 0
    },
  },

  watch: {
    files: function(files) {
        if (!files) {
          return
        }
        this.files.forEach(file => {
          const packageType = pathOr('', ['content', 'packageType'], file)
          file.subtype = this.getFilePropertyVal(file.properties, 'subtype')
          file.icon = this.getFilePropertyVal(file.properties, 'icon')
          if (packageType === 'Collection') {
            file.subtype = 'Folder'
          }
          if (file.externalFile) {
            file.subtype = 'External File'
          }
          const fileId = pathOr('', ['content', 'id'], file)
          const obj = find(pathEq(['content', 'id'], fileId), this.selectedItems)
          if (obj) {
            this.$refs.Table.toggleRowSelection(file, true)
          }
        })
    }
  },

  methods: {
    /**
     * Get package display name
     * @params {Object} file
     * @returns {String}
     */
    getPackageDisplayName: function(file) {
      return packageDisplayName(file.content.name, file.extension, file.children)
    },

    /**
     * Handles navigate-breadcrumb event
     * @param {String} fileId
     */
    handleNavigateBreadcrumb: function(fileId) {
      this.getFiles(fileId)
    },

    /**
     * Creates default relationship
     */
    createDefaultRelationship: function(datasetId) {
      const url = `${this.config.conceptsUrl}/datasets/${datasetId}/relationships`
      return this.sendXhr(url, {
        method: 'POST',
        header: {
          'Authorization': `bearer ${this.userToken}`
        },
        body: {
          name: 'belongs_to',
          displayName: 'Belongs To',
          description: '',
          schema: []
        }
      }).then(this.createFileRelationship.bind(this))
    },

    /**
     * Creates relationships with file(s)
     */
    createFileRelationship: function() {
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      const url = `${this.config.conceptsUrl}/datasets/${datasetId}/proxy/package/instances`
      const modelId = propOr('', 'id', this.concept)

      const queues = this.selectedItems.map(item => {
        const recordId = pathOr('', ['params', 'instanceId'], this.$route)
        const packageId = pathOr('', ['content', 'id'], item)
        let linkTarget = {
          'ConceptInstance': {
            id: recordId
          }
        }
        if (this.isFile) {
          linkTarget = {
            'ProxyInstance': {
              type: 'package',
              externalId: packageId
            }
          }
        }
        return this.sendXhr(url, {
          method: 'POST',
          header: {
            'Authorization': `bearer ${this.userToken}`
          },
          body: {
            externalId: packageId,
            targets: [{
              direction: 'FromTarget',
              linkTarget,
              relationshipType: 'belongs_to',
              relationshipData: []
            }]
          }
        })
      })
      // this maps over all the queued responses to guarantee that all responses are returned regardless of error status
      return Promise.all(queues.map(q => {
        return q.catch(err => ({status: err.status}))
      }))
    },

    /**
     * Checks if there are any errors returned from promise.all queues
     * @param {Array} responses
     * @returns {Boolean}
     */
    checkForRelationshipErrors: function(responses) {
      const errors = defaultTo([], responses).filter(resp => resp && resp.status >= 400)
      return errors.length > 0
    },

    /**
     * Create relationship
     */
    createRelationship: function() {
      this.isCreating = true

      // check if relationship exists for dataset amongst list
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      const url = `${this.config.conceptsUrl}/datasets/${datasetId}/relationships`
      this.sendXhr(url, {
        header: {
          'Authorization': `bearer ${this.userToken}`
        }
      })
      .then(resp => {
        const belongsTo = find(propEq('name', 'belongs_to'), resp)
        if (resp.length === 0 || !belongsTo) {
          // if not, create a default, then create the file relationship
          return this.createDefaultRelationship(datasetId)
        }
        return this.createFileRelationship()
      })
      .then((resp) => {
        // check for errors
        const hasErrors = this.checkForRelationshipErrors(resp)
        if (hasErrors) {
          this.isCreating = false
          const hasConflict = find(propEq('status', 409), resp)
          const msg = hasConflict ? 'File relationship already exists. Please choose a different file.' : 'Error trying to add files.'
          EventBus.$emit('toast', {
            detail: {
              type: 'error',
              msg
            }
          })

          return this.handleXhrError(resp)
        }

        // add relationships to file(s)
        EventBus.$emit('refresh-table-data', {
          name: 'package',
          displayName: 'Files',
          count: this.selectedItems.length,
          type: 'Add'
        })

        EventBus.$emit('toast', {
          detail: {
            msg: `A new relationship has been created`,
            type: 'success'
          }
        })
        this.closeSideDrawer()
        this.isCreating = false
      })
    },

    /**
     * Creates the GET url for files
     * @param {String} fileId
     */
    getFilesUrl: function(fileId) {
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      if (!datasetId || !this.userToken) {
        return
      }
      const qString = `api_key=${this.userToken}&includeAncestors=true`
      const url = fileId ? `packages/${fileId}` : `datasets/${datasetId}`
      return `${this.config.apiUrl}/${url}?${qString}`
    },

    /**
     * Removes files already related to record
     * @param {Object} payload
     * @returns {Array}
     */
    filterFiles: function(payload) {
      const allFiles = propOr([], 'children', payload)
      const ancestors = propOr([], 'ancestors', payload)
      const getFileId = pathOr('', ['content', 'id'])

      this.ancestors = ancestors
      this.file = payload

      if (this.relatedFiles.length === 0) {
        this.files = this.returnSort(this.sortBy, allFiles, 'asc')
        return
      }

      const pred = file => this.relatedFiles.indexOf(getFileId(file)) < 0
      const filteredFiles = allFiles.filter(pred)
      this.files = this.returnSort(this.sortBy, filteredFiles, this.sortDirection)
    },

    /**
     * Get files for dataset or collection
     * @param {String} fileId
     */
    getFiles: function(fileId) {
      this.fileId = fileId
      const url = this.getFilesUrl(fileId)
      if (!url) {
        return
      }
      this.sendXhr(url)
        .then(this.filterFiles.bind(this))
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Opens the side drawer and sets the drawer title
     * @param {String} conceptId
     */
    openDrawer: function(conceptId) {
      this.conceptId = conceptId
      this.visible = true
      this.getFiles()
    },

    /**
     * Handles close-side-drawer event
     */
    closeSideDrawer: function() {
      this.visible = false

      this.$nextTick(() => {
        this.showCancelButton = false
        this.files = []
        this.selectedItems = []
      })
    },

    /**
     * Format file storage columns
     * @param {Object} row
     * @param {Object} column
     */
    fileStorageFormatter(row, column) {
      return this.formatMetric(row.storage)
    },

    /**
     * Format date for files table
     * @param {Object} row
     * @param {Object} column
     */
    dateCreatedFormatter(row, column) {
      return this.formatDate(row.content.createdAt)
    },

    /**
     * Handle sort change event
     * @param {String} column
     */
    handleSortChange(column) {
      this.files = this.returnSort(column, this.files)
    },

    /**
     * Checkbox display logic
     * @param {Object} store
     * @param {Object} currentRow
     * @param {Object} hoverRow
     */
    showRowCheckbox(store, currentRow, hoverRow) {
      const tableState = store.states

      // check if rows match
      const matchPath = pathOr('', ['content', 'id'])
      const currentRowId = matchPath(currentRow)
      const hoverRowId = matchPath(hoverRow)
      const rowsMatch = (currentRowId === hoverRowId)

      // check if row is in table state selection array
      const selection = tableState.selection
      const rowIdx = selection.findIndex(row => row.content.id)

      if (tableState.isAllSelected === true || rowsMatch === true || rowIdx >= 0) {
        return true
      }
      return false
    },

    /**
     * Handle table select all
     * @param {Array} selection
     */
    handleTableSelectAll(selection) {
      // if selection length is greater than zero, then add to selectedItems;
      if (selection.length > 0) {
        const allItems = this.selectedItems.concat(selection)
        this.selectedItems = uniq(allItems)
        return
      }
      // if not, use iterate through selectedItems and filter out items in the data list
      const filteredItems = this.selectedItems.filter(item => {
        const itemId = pathOr('', ['content', 'id'], item)
        const row = find(pathEq(['content', 'id'], itemId), this.files)
        return !row
      })
      this.selectedItems = uniq(filteredItems)
    },

    /**
     * Handles table row selections
     * @param {Array} selection
     * @param {Object} row
     */
    handleSelect: function(selection, row) {
      // check if row is in selectedItems, if yes, then remove it
      const rowId = pathOr('', ['content', 'id'], row)
      const obj = find(pathEq(['content', 'id'], rowId), this.selectedItems)
      if (obj) {
        this.selectedItems = this.selectedItems.filter(item => pathOr('', ['content', 'id'], item) !== rowId)
        return
      }
      // if no, then add it to selectedItems
      this.selectedItems.push(row)
    },

    /**
    * Handle table cell enter
    * @param {Object} row
    */
    handleTableCellEnter(row) {
      this.hoverRow = row
    },

    /**
    * Handle table cell leave
    * @param {Object} event
    */
    handleTableCellLeave(row, column, cell, event) {
      const nodeName = pathOr('', ['toElement', 'nodeName'])(event)
      const whiteList = ['TD', 'TR']
      // if moving to element other than TD or TR, reset hover row
      if (whiteList.indexOf(nodeName) < 0) {
        this.hoverRow = {}
      }
    },

    /**
     * Sorts review table
     * @param {String} sortPath
     */
    sortColumn: function(sortPath) {
      this.selectedItems = this.returnSort(sortPath, this.selectedItems)
    }
  }
}
</script>

<style lang="scss">
@import '../../../../assets/variables';

.drawer {

  .el-table {
    border: solid 1px $gray_2;

    tr.el-table__row {
      background: #fff !important;
    }

    button {
      font-size: inherit;
    }
  }

  td {
    color: #000;
  }

  .svg-icon {
    height: 24px;
    width: 24px;
  }

  .table-nav-bar {
    margin: 16px 0 16px;
    display: flex;
  }

  .table-nav-bar--breadcrumb {
    flex: 1;
  }

  .file-review-table {
    position: relative;
    overflow: hidden;
  }

  .bf-table-header {
    padding: 16px 0 8px;
    background: #fff;
    border-bottom: none;
  }

  .file-row {
    color: #000;
    height: 48px;
    border-top: solid 1px $gray_2;

    &.first {
      border-top: none;
    }

    .file-name {
      display: flex;
      align-items: center;
      flex-shrink: unset;

      img {
        margin-right: 16px;
      }

      .file-name--text {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }

  .el-table .cell {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .breadcrumb-navigation {
    font-size: 16px;
    line-height: 19px;
  }
}
</style>
