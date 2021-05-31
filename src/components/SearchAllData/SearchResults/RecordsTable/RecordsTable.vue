<template>
  <div class="records-table">
    <el-table
      ref="table"
      :border="true"
      :data="data"
      @sort-change="onSortChange"
      @row-click="onRowClick"
    >
      <el-table-column
        v-for="heading in headings"
        :key="heading.name"
        :prop="heading.name"
        :label="heading.displayName"
        :sortable="isSortable ? 'custom' : false"
      >
        <template slot="header">
          <el-tooltip
            v-if="isSortable"
            :content="heading.displayName"
            placement="to"
          >
            <button :class="{ 'sort-active': tableSearchParams.orderBy === heading.name }">
              {{ heading.displayName }}
              <svg-icon
                name="icon-sort-asc"
                class="sort-icon"
                :dir="tableSearchParams.ascending && tableSearchParams.orderBy === heading.name ? 'up' : 'down'"
              />
            </button>
          </el-tooltip>

          <template v-else>
            {{ heading.displayName }}
          </template>
        </template>
        <template slot-scope="scope">
          <div
            :class="{ 'model-title': heading.modelTitle }"
            v-html="$sanitize(scope.row[heading.name], ['a'])"
          />
        </template>
      </el-table-column>

      <el-table-column
        v-if="showMenuColumn"
        label=""
        fixed="right"
        align="right"
        width="54"
        :sortable="isSortable ? 'custom' : false"
        :resizable="false"
      >
        <template slot-scope="scope">
          <div
            class="record-actions-wrap"
          >
            <table-menu
              :file="scope.row"
              :search-all-data-menu="searchAllDataMenu"
              :search-all-data-records="searchAllDataMenu"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  propOr
} from 'ramda'

import TableMenu from '@/components/TableMenu/TableMenu.vue'

import BfStorageMetrics from '@/mixins/bf-storage-metrics'
import FileIcon from '@/mixins/file-icon/index'
import FormatDate from '@/mixins/format-date'
import TableFunctions from '@/mixins/table-functions'
import Sorter from '@/mixins/sorter'

export default {
  name: 'RecordsTable',

  components: {
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
    searchAllDataMenu: {
      type: Boolean,
      default: false
    },
    searchAllDataRecords: {
      type: Boolean,
      default: false
    },
    headings: {
      type: Array,
      default: () => []
    },
    showMenuColumn: {
      type: Boolean,
      default: true
    },
    isSortable: {
      type: Boolean,
      default: false
    },
    tableSearchParams: {
      type: Object,
      default: () => {
        return {}
      }
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

  methods: {
    /**
     * Action when clicking a row
     */
    onRowClick: function(row, column) {
     const columnProperty = propOr('', 'property', column)
     if (columnProperty !== undefined) {
       this.$emit('navigate-to-record', row)
     }
    },

    /**
     * Callback from sort change
     * Set new sort order and property
     * @param {Object} evt
     */
    onSortChange: function(evt) {
      const property = propOr('', 'prop', evt)

      const ascending = !(this.tableSearchParams.orderBy === property && this.tableSearchParams.ascending)

      const orderDirection = ascending ? 'asc' : 'desc'

      this.$emit('sort', {
        orderBy: property,
        ascending,
        orderDirection
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.records-table {
  position: relative;
}
.el-table {
  width: 100%;
}
.el-table--border /deep/ td {
  border-right: 1px solid transparent;
}

/deep/ .hover-row,
/deep/ .el-table__row:hover {
  background: #f5f6f9;
}
.btn-selection-action {
  align-items: center;
  display: flex;
  font-size: 14px;
}

/deep/ .el-table {
  border-radius: 4px;
  tr {
    transition: background-color 0.3s ease-in-out;
  }
  td {
    padding: 8px 0;
    &:hover {
      cursor: pointer;
    }
  }
  th {
    padding: 10px 0;
    font-size: 12px;
    font-weight: 600;
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
.record-actions-wrap {
  display: flex;
  justify-content: flex-end;
}
</style>
