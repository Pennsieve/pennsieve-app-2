<template>
  <div class="files-table">
    <div
      v-if="selection.length > 0"
      class="selection-menu-wrap mb-16"
    >
      <el-checkbox
        id="check-all"
        v-model="checkAll"
        :indeterminate="isIndeterminate"
        @change="onCheckAllChange"
      />

      <span id="selection-count-label">
        {{ selectionCountLabel }}
      </span>
      <ul class="selection-actions unstyled">
       <template v-if='withinDeleteMenu'>
       <!-=-
      <li class="mr-24">
        <button
          v-if="!searchAllDataMenu"
          class="linked btn-selection-action"
          :disabled="datasetLocked"
          @click="$emit('delete')"
        >
          <svg-icon
            class="mr-8"
            icon="icon-trash"
            height="16"
            width="16"
          />
          Delete permanently
        </button>
      </li>
      -->
      <li class="mr-24">
        <button
          v-if="!searchAllDataMenu"
          class="linked btn-selection-action"
          :disabled="datasetLocked"
          @click="$emit('move')"
        >
          <svg-icon
            class="mr-8"
            icon="icon-move-file"
            height="16"
            width="16"
          />
          Restore {{ selectionCountLabel }}
        </button>
      </li>
      </template>
       <template v-else>
        <li class="mr-24">
          <button
            v-if="!searchAllDataMenu"
            class="linked btn-selection-action"
            :disabled="datasetLocked"
            @click="$emit('delete')"
          >
            <svg-icon
              class="mr-8"
              icon="icon-trash"
              height="16"
              width="16"
            />
            Delete
          </button>
        </li>
        <li class="mr-24">
          <button
            v-if="!searchAllDataMenu"
            class="linked btn-selection-action"
            :disabled="datasetLocked"
            @click="$emit('move')"
          >
            <svg-icon
              class="mr-8"
              icon="icon-move-file"
              height="16"
              width="16"
            />
            Move to&hellip;
          </button>
        </li>
         </template>
        <li>
          <button
            class="linked btn-selection-action"
            @click="onDownloadClick"
          >
            <svg-icon
              class="mr-8"
              icon="icon-upload"
              dir="down"
              height="16"
              width="16"
            />
            Download
          </button>
        </li>
      </ul>
    </div>

    <el-table
      ref="table"
      :border="true"
      :data="data"
      :default-sort="{prop: 'content.name', order: 'ascending'}"
      :row-class-name="getRowClassName"
      @selection-change="handleTableSelectionChange"
      @sort-change="onSortChange"
      @row-click="onRowClick"
    >
      <el-table-column
        type="selection"
        align="center"
        fixed
        width="50"
      />
      <el-table-column
        v-if="searchAllDataMenu"
        prop="datasetName"
        label="Dataset"
        :sortable="true"
        :render-header="renderHeader"
        :sort-orders="sortOrders"
      />
      <el-table-column
        prop="content.name"
        label="Name"
        fixed="left"
        min-width="200"
        :resizable="true"
        :sortable="!isSearchResults"
        :render-header="renderHeader"
        :sort-orders="sortOrders"
      >
        <template slot-scope="scope">
          <bf-file-label
            :file="scope.row"
            :open-file-button="true"
            :search-all-data-menu="true"
            @click-name="onFileLabelClick(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="subtype"
        label="Kind"
        :sortable="!isSearchResults"
        :render-header="renderHeader"
        :sort-orders="sortOrders"
      />

      <el-table-column
        prop="storage"
        label="Size"
        :sortable="!isSearchResults"
        :render-header="renderHeader"
        :sort-orders="sortOrders"
      >
        <template slot-scope="scope">
          {{ formatMetric(scope.row.storage) }}
        </template>
      </el-table-column>

      <el-table-column
        prop="content.createdAt"
        label="Date Created"
        width="180"
        :sortable="!isSearchResults"
        :render-header="renderHeader"
        :sort-orders="sortOrders"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.content.createdAt) }}
        </template>
      </el-table-column>
      <template v-if='withinDeleteMenu'>
        <el-table-column
          prop="content.createdAt"
          label="Date Deleted"
          width="180"
          :sortable="!isSearchResults"
          :render-header="renderHeader"
          :sort-orders="sortOrders"
        >
          <template slot-scope="scope">
            {{ formatDate(scope.row.content.updatedAt) }}
          </template>
        </el-table-column>
      </template>
      <template v-else>
      </template>
      <el-table-column
        label=""
        fixed="right"
        align="right"
        width="54"
        :sortable="false"
        :resizable="false"
      >
        <template slot-scope="scope">
          <div class="file-actions-wrap">
            <table-menu
              v-if="getPermission('editor') || searchAllDataMenu"
              :file="scope.row"
              :multiple-selected="multipleSelected"
              :search-all-data-menu="searchAllDataMenu"
              @delete="deleteFile"
              @move="moveFile"
              @download-file="downloadFile"
              @process-file="processFile"
              @copy-url="getPresignedUrl"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  pathOr,
  propOr
} from 'ramda'
import {
  mapGetters,
  mapState
} from 'vuex'
import EventBus from '@/utils/event-bus'

import BfFileLabel from '../datasets/files/bf-file/BfFileLabel.vue'
import TableMenu from '@/components/TableMenu/TableMenu.vue'

import BfStorageMetrics from '@/mixins/bf-storage-metrics'
import FileIcon from '@/mixins/file-icon/index'
import FormatDate from '@/mixins/format-date'
import TableFunctions from '@/mixins/table-functions'
import Sorter from '@/mixins/sorter'

export default {
  name: 'FilesTable',

  components: {
    BfFileLabel,
    TableMenu
  },

  mixins: [
    BfStorageMetrics,
    FileIcon,
    FormatDate,
    Sorter,
    TableFunctions
  ],

  props: {
    data: {
      type: Array,
      default: () => []
    },
    multipleSelected: {
      type: Boolean,
      default: false
    },
    searchAllDataMenu: {
      type: Boolean,
      default: false
    },
    isSearchResults: {
      type: Boolean,
      default: false
    },
    nonSortableColumns: {
      type: Array,
      default: () => []
    },
    withinDeleteMenu: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      activeRow: {},
      selection: [],
      sortOrders: ['ascending', 'descending'],
      checkAll: false
    }
  },

  computed: {
    ...mapGetters([
      'getPermission',
      'datasetLocked',
    ]),

    ...mapState([
      'dataset',
      'filesProxyId'
    ]),
    /**
     * Compute if the checkbox is indeterminate
     * @returns {Boolean}
     */
    isIndeterminate: function() {
      return this.selection.length > 0 && this.selection.length < this.data.length
    },

    /**
     * Compute selection count label
     * @returns {String}
     */
    selectionCountLabel: function() {
      const selectionCount = this.selection.length
      const fileWord = selectionCount === 1
        ? 'file'
        : 'files'
      return `${selectionCount} ${fileWord} selected`
    }
  },

  methods: {
    /**
     * Select the row
     * @param {Object} row
     * @param {Boolean} selected
     */
    selectRow: function(row, selected = null) {
      this.$refs.table.toggleRowSelection(row, selected)
    },

    /**
     * Checkbox display logic
     * @param {Object} store
     */
    showRowCheckbox: function(store) {
      if (this.datasetLocked) {
        return false
      }

      const tableSelection = pathOr([], ['states', 'selection'], store)
      return tableSelection.length > 0
    },

    /**
     * Sets the active row for the menu clicked
     * @param {Object} row
     */
    setActiveRow: function(row) {
      this.activeRow = row
    },

    /**
     * Handle table selection change
     * @param {Array} selection
     */
    handleTableSelectionChange: function(selection) {
      this.selection = selection
      this.checkAll = this.data.length === selection.length
      this.$emit('selection-change', selection)
    },

    /**
     * Callback from sort change
     * Set new sort order and property
     * @param {Object} evt
     */
    onSortChange: function(evt) {
      const order = propOr('', 'order', evt)
      const property = propOr('', 'prop', evt)
      this.sortBy = property

      const sortOrder = order === 'descending' ? 'desc' : 'asc'
      this.sortDirection = sortOrder
    },

    /**
     * Emit event for file label click
     * @param {Object} file
     */
    onFileLabelClick: function(file) {
      this.$emit('click-file-label', file)
    },

    /**
     * Deselect all files
     */
    deselectAll: function() {
      this.$refs.table.clearSelection()
    },

    /**
     * Check all, or clear the selection
     * @param {Boolean} shouldCheckAll
     */
    onCheckAllChange: function(shouldCheckAll) {
      if (shouldCheckAll) {
        this.$refs.table.toggleAllSelection()
      } else {
        this.$refs.table.clearSelection()
      }
    },

    onRowClick: function(row,selected){
      console.log(row)
      console.log(selected)
      this.$refs.table.clearSelection()
      this.$refs.table.toggleRowSelection(row, true)
    },

    /**
     * handle the table header download click
     */
    onDownloadClick: function() {
      EventBus.$emit('trigger-download', this.selection)
    },

    /**
     * delete file from file menu
     * @param {Object} file
     */
    deleteFile: function(file) {
      this.setFileMenuSelection(file)
      this.$emit('delete')
    },

    /**
     * Movie file from file menu
     * @param {Object} file
     */
    moveFile: function(file) {
      this.setFileMenuSelection(file)
      this.$emit('move')
    },

    /**
     * Downloads file from the file menu
     */
    downloadFile: function(file) {
      this.setFileMenuSelection(file)
      this.$emit('download', file)
    },

    /**
     * Process file
     * @param {Object} file
     */
    processFile: function(file) {
      this.$emit('process', file)
    },

    /**
     * Get presigned URL and copy to clipboard
     * @param {Object} file
     */
    getPresignedUrl: function(file) {
      this.$emit('copy-url', file)
    },

    /**
     * Select file for file menu action
     * @param {Object} file
     */
    setFileMenuSelection: function(file) {
      this.deselectAll()
      this.selectRow(file, true)
    },

    /**
     * Compute row class name
     * @returns {String}
     */
    getRowClassName: function(tableRow) {
      const { row } = tableRow
      const id = pathOr('', ['content', 'nodeId'], row)
      const trimmedId = id.replace(/:/g, '')
      return `file-row-${trimmedId}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/_variables.scss';

.files-table {
  position: relative;
  flex:1 1 auto;
  min-width: 0;
}
.el-table {
  width: 100%;
}
.el-table--border /deep/ td {
  border-right: 1px solid transparent;
}

/deep/ .btn-open-file {
  display: none;
}

/deep/ .hover-row {
  background: #f5f6f9;
  .show-btn-open-file {
    .btn-open-file {
      display: inline-block;
    }
    .icon-item {
      display: none;
    }
  }
}
.btn-selection-action {
  align-items: center;
  display: flex;
  font-size: 14px;
}
.link-file {
  color: $text-color;
  &:hover, &:focus {
    color: $app-primary-color;
  }
}
#check-all {
  margin-right: 37px
}
#selection-count-label {
  font-size: 12px;
  font-weight: 700;
  transform: translateY(1px)
}
.selection-menu-wrap {
  background: #e9edf6;
  border: 1px solid $gray_2;
  box-sizing: border-box;
  border-radius: 3px 3px 0 0;
  display: flex;
  padding: 11px 15px 10px;
  position: absolute;
  justify-content: space-between;
  width: 100%;
  z-index: 10
}
.selection-actions {
  display: flex;
  flex: 1;
  justify-content: flex-end;
}
/deep/ .el-table {
  border-radius: 4px;
  tr {
    transition: background-color 0.3s ease-in-out;
  }
  td, th {
    padding: 8px 0;
  }
  .cell {
    padding-left: 16px;
    padding-right: 16px;
  }
  .caret-wrapper {
    display: none;
  }
  .highlight {
    background-color: $status_yellow;
  }
}
.file-actions-wrap {
  display: flex;
  justify-content: flex-end;
}
</style>
