<template>
  <div class="dataset-file-types">
    <h2 v-if="showHeading">
      File Types
    </h2>
    <div
      v-loading="isLoading"
      class="dataset-file-types-loading-wrap"
      element-loading-background="#FAFAFA"
    >
      <div
        v-show="hasFileTypes && isLoading === false"
        class="chart-wrapper"
      >
        <h3 v-if="showTotal">
          {{ totalFiles }} Total Files
        </h3>
        <horizontal-bar-chart
          chart-id="exploreFileTypesChart"
          :chart-data="chartData"
        />
      </div>

      <sidebar-empty-state v-if="!hasFileTypes && isLoading === false">
        <img
          src="/static/images/illustrations/illo-empty-file-types.svg"
          width="255"
          height="113"
          alt="Image representing bar chart of file types would look like if there were files"
        >
        <h3>Add Some Files to your Dataset!</h3>
        <p>
          <router-link :to="{name: 'dataset-files'}">
            Upload some files
          </router-link> to set up your Dashboard.
        </p>
      </sidebar-empty-state>
    </div>
  </div>
</template>

<script>
  import * as d3 from 'd3'
  import { pathOr, values, defaultTo, sum, toPairs, fromPairs, keys, prepend, dissoc, head, last } from 'ramda'

  import SidebarEmptyState from '../../../shared/SidebarEmptyState/SidebarEmptyState.vue'
  import HorizontalBarChart from '../../../shared/BarCharts/HorizontalBarChart.vue'
  import Request from '../../../../mixins/request'
  import ComputeOthers from '../../../../mixins/ComputeOthers'
  import { mapGetters, mapActions } from 'vuex'

  export default {
    name: 'DatasetFileTypes',

    components: {
      SidebarEmptyState,
      HorizontalBarChart,
    },

    mixins: [
      Request,
      ComputeOthers
    ],

    props: {
      showHeading: {
        type: Boolean,
        default: true
      },
      showTotal: {
        type: Boolean,
        default: true
      },
      chartSize: {
        type: Number,
        default: 165
      },
      files: {
        type: Object,
        default: function() {
          return {}
        }
      }
    },

    data: function() {
      return {
        fileTypes: {},
      }
    },

    computed: {
      ...mapGetters([
        'userToken',
        'config',
        'dataset'
      ]),

      /**
       * Compute if the dataset has files
       * @returns {Boolean}
       */
      hasFileTypes: function() {
        return this.totalFiles >= 1
      },

      /**
       * Compute total files
       * @returns {Number}
       */
      totalFiles: function() {
        return Object.keys(this.fileTypes)
          .map(key => this.fileTypes[key])
          .reduce((acc, numFiles) => acc + numFiles, 0)
      },

      sortedFiles: function() {
        const files = toPairs(this.fileTypes).sort(function(a, b) {
          return b[1] - a[1]
        })
        const transformed = files.map(d => {
          return {
            key: head(d),
            value: last(d)
          }
        })
        return transformed
      },

      /**
       * Compute chart data with top four file types, and the rest grouped together
       * @returns {Object}
       */
      chartData: function() {
        if (this.sortedFiles.length > 0) {
          return this.computeOthers(this.sortedFiles, 4)
        }
      },

      /**
       * Get metrics URL
       * @returns {String}
       */
      getFileTypesUrl: function() {
        const datasetId = pathOr('', ['content', 'id'], this.dataset)
        if (this.config.apiUrl && this.userToken && datasetId && Object.keys(this.files).length === 0) {

          return `${this.config.apiUrl}/datasets/${datasetId}/packageTypeCounts?api_key=${this.userToken}`
        }
      }
    },

    watch: {
      getFileTypesUrl: {
        handler: function() {
          this.fetchFileTypes()
        },
        immediate: true
      },
      files: {
        handler: function(val) {
          if (Object.keys(val).length) {
            this.fileTypes = val
            this.isLoading = false
          }
        },
        immediate: true
      }
    },

    beforeDestroy: function() {
      this.isLoading = true
      this.fileTypes = {}
      // Destroy chart if it exists
      if (this.chart && typeof this.chart.destroy === 'function') {
        this.chart.destroy()
      }
    },

    methods: {
      ...mapActions([
        'updateExploreFiles'
      ]),

      /**
       * Fetch filetypes from the server
       */
      fetchFileTypes: function() {
        if (this.getFileTypesUrl) {
          this.sendXhr(this.getFileTypesUrl)
          .then(response => {
            const fileTypes = defaultTo({}, response)
            this.fileTypes = dissoc('Collection', fileTypes)
            this.updateExploreFiles({
              name: 'package',
              displayName: 'Files',
              count: defaultTo(0, this.totalFiles)
            })
          })
          .catch(this.handleXhrError.bind(this))
        }
      },
    }
  }
</script>

<style lang="scss">
  @import '../../../../assets/_variables.scss';

  .dataset-file-types {
    padding: 24px;
    .dataset-file-types-loading-wrap {
      min-height: 182px;
    }
    .el-loading-fade-enter-active {
      transition: none;
    }

    .chart-wrapper {
      width: 100%;
      height: 190px;
      overflow: hidden;
    }

    h2 {
      color: #C1C1C1;
    }
  }
</style>
