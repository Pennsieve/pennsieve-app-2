<template>
  <el-table
    ref="datasetTemplatesTable"
    :data="sortedDatasetTemplates"
    @bf-sort="onSortChange"
  >
    <el-table-column
      prop="name"
      label="Name"
      width="350"
      :render-header="renderHeader"
    />
    <el-table-column
      prop="description"
      label="Subtitle"
      :render-header="renderHeader"
    />
    <el-table-column
      class-name="column-no-padding"
      width="50"
    >
      <template slot-scope="scope">
        <el-dropdown
          trigger="click"
          placement="bottom-end"
          @command="onDatasetTemplateMenuClick"
        >
          <span
            class="btn-file-menu el-dropdown-link"
            @click.prevent.stop="setActiveDatasetTemplate(scope.row)"
          >
            <svg-icon
              name="icon-menu"
              height="16"
              width="16"
            />
          </span>
          <el-dropdown-menu
            slot="dropdown"
            class="bf-menu"
            :offset="9"
          >
            <el-dropdown-item command="update">
              Rename Template
            </el-dropdown-item>
            <el-dropdown-item command="delete">
              Delete Template
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { mapState } from 'vuex'

import TableFunctions from '../../../mixins/table-functions'
import Sorter from  '../../../mixins/sorter'

export default {
  name: 'DatasetTemplatesTable',

  mixins: [
    TableFunctions,
    Sorter
  ],

  data() {
    return {
      sortBy: 'name'
    }
  },

  computed: {
    ...mapState([
      'datasetTemplates'
    ]),

    sortedDatasetTemplates: function() {
      return this.returnSort(this.sortBy, this.datasetTemplates, this.sortDirection)
    }
  },

  methods: {
    /**
     * Update active dataset template
     * @param {Object} row
     */
    setActiveDatasetTemplate: function(row) {
      this.$emit('set-active-dataset-template', row)
    },

    /**
     * Handler for dataset template menu click
     * @param {String} name
     */
    onDatasetTemplateMenuClick: function(name) {
      this.$emit('dataset-template-menu-click', name)
    },

    /**
     * Handle sort change
     * @param {String} property
     */
    onSortChange(property) {
      this.onTableSort(property)
    },
  }
}
</script>

