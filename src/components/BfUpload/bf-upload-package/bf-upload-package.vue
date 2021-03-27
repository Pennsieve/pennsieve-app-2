<template>
  <div
    class="bf-upload-package"
    :class="{
      'is-uploaded': isUploaded,
      'is-uploading': uploading
    }"
  >
    <div class="bf-upload-package-wrap">
      <bf-waiting-icon
        v-if="processing"
        class="icon-package icon-waiting"
      />

      <template v-if="!processing">
        <button
          class="icon-expand"
          @click="toggleFiles"
        >
          <svg-icon
            v-if="hasMultipleFiles"
            name="icon-arrow-up"
            :dir="showFiles ? 'down' : 'right'"
            height="6"
            width="9"
          />
        </button>

        <span class="icon-package">
          <svg-icon
            v-if="hasWarning"
            icon="icon-warning-circle"
            color="#f5a623"
          />
          <el-tooltip
            placement="right"
            :content="tooltipError"
          >
            <svg-icon
              v-if="hasError"
              icon="icon-warning-circle"
              color="#e94b4b"
            />
          </el-tooltip>

          <img
            v-if="!hasWarning && !hasError"
            class="svg-icon icon-item"
            :src="fileIcon(item.icon, item.packageType)"
          >
        </span>
      </template>

      <el-tooltip
        placement="top-start"
        popper-class="tooltip-upload"
        :content="displayName"
        :disabled="displayName.length < 35"
      >
        <div
          class="package-name mr-8"
        >
          <a
            v-if="isUploaded && !isUnavailable"
            @click="handleFileClick(item)"
          >
            {{ displayName }}
          </a>
          <span v-else>
            {{ displayName }}
          </span>
        </div>
      </el-tooltip>

      <template v-if="!processing && showPath">
        <el-tooltip
          placement="top-start"
          popper-class="tooltip-upload"
          :content="path"
          :disabled="path.length < 35"
        >
          <div
            ref="pathInfo"
            class="path-info mr-8"
          >
            {{ path }}
          </div>
        </el-tooltip>
      </template>
      <span class="package-info">
        <span
          v-if="processing"
          class="status"
        >
          {{ status }}
        </span>
        <template v-if="size !== 0 && !hasError && !processing">
          <span
            v-if="totalUploaded !== 0 && !isUploaded"
            class="package-progress"
          >
            {{ totalProgress }} <span>of</span>
          </span>
          <span
            v-if="size !== 0"
            class="package-size"
          >
            {{ size }}
          </span>
        </template>

        <el-tooltip
          v-if="!isUploaded"
          placement="right"
          :content="tooltip"
        >
          <svg-icon
            class="icon-remove"
            color="#bdbdbd #ffffff"
            icon="icon-x-circle"
            height="27"
            width="27"
            @click="removePackage"
          />
        </el-tooltip>


        <bf-waiting-icon
          v-if="isUnavailable"
          class="icon-package icon-waiting unavailable-throbber"
        />

        <svg-icon
          v-if="isUploaded && !isUnavailable"
          icon="icon-done-check-circle"
          color="#17bb62"
        />
      </span>

      <bf-progress-bar
        v-if="uploading && !hasError"
        class="package-progress-bar"
        :loaded="totalUploaded"
        :total="item.groupSize"
      />
    </div>
    <div
      v-if="showFiles && hasMultipleFiles"
      class="bf-upload-file-wrap"
    >
      <div
        v-if="hasWarning && !hasError"
        class="package-warning"
      >
        <strong>{{ warningMessage }}</strong>. Files will still be uploaded, but you may not be able to use our built-in viewers.
      </div>
      <div
        v-if="!hasWarning && hasError"
        class="package-error"
      >
        <strong>Error</strong>. One or more source files failed to upload, please try again.
      </div>
      <template v-if="!hasError">
        <bf-upload-file
          v-for="file in item.files"
          :key="file.uploadId"
          :item="file"
          :submitted="submitted"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { propOr, compose, join, flatten, pathOr, defaultTo, pathEq } from 'ramda'

import BfUploadFile from '../bf-upload-file/bf-upload-file.vue'
import BfProgressBar from '@/components/shared/bf-progress-bar/bf-progress-bar.vue'
import BfWaitingIcon from '@/components/shared/bf-waiting-icon/bf-waiting-icon.vue'

import BfStorageMetricsMixin from '@/mixins/bf-storage-metrics'
import FileIcon from '@/mixins/file-icon'
import EventBus from '@/utils/event-bus'
import CheckOverflow from '@/mixins/check-overflow/index'


export default {
  name: 'BfUploadPackage',

  components: {
    BfUploadFile,
    BfProgressBar,
    BfWaitingIcon
  },

  mixins: [
    BfStorageMetricsMixin,
    FileIcon,
    CheckOverflow
  ],

  props: {
    showPath: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: function() {
        return {
          packageName: '',
          packageType: '',
          packageSubtype: '',
          previewPath: '',
          fileType: '',
          files: [
            {
              uploadId: 0,
              fileName: '',
              size: 0,
              multipartUploadId: '',
              chunkedUpload: {
                chunkSize: 0,
                totalChunks: 0
              },
              importId: ''
            }
          ],
          warnings: [],
          groupSize: 0,
          hasWorkflow: true,
          importId: '',
          icon: ''
        }
      }
    },
    name: {
      type: String,
      default: ''
    },
    processing: {
      type: Boolean
    },
    isUploaded: {
      type: Boolean
    },
    /**
     * If the file has been submitted to be uploaded
     */
    submitted: {
      type: Boolean
    },
    hasError: {
      type: Boolean
    }
  },

  data: function () {
    return {
      status: 'processing',
      uploading: false,
      showFiles: false,
      totalUploaded: 0,
      tooltipError: 'There was an error uploading your file(s). Please try again.'
    }
  },

  computed: {
    /**
     * Compute the display name which will decode
     * the response from the API
     * @returns {String}
     */
    displayName: function() {
      return decodeURIComponent(this.name)
    },

   /**
     * Checks if the file is still in an UNAVAILABLE
     * or uploading state
     * @param {String} file
     */
    isUnavailable: function() {
      return pathEq(['package', 'content', 'state'], 'UNAVAILABLE', this.item)
    },

    /**
     * Compute path for package
     * The filepath comes back with each file, but all
     * files are going to the same place as one package
     * @returns {String}
     */
    path: function() {
      return compose(
        join('/'),
        defaultTo([]),
        propOr([], 'previewPath')
      )(this.item)
    },

    icon: function() {
      const type = this.item.packageType

      if (type) {
        return this.getIcon(type).toLowerCase();
      } else {
        return `settings`
      }
    },

    /**
     * Compute tooltip based on submitted state
     * @return {string}
     */
    tooltip: function () {
      return this.submitted ? 'Cancel Upload' : 'Delete package'
    },

    /**
     * Compute if package has multiple files
     * @returns {boolean}
     */
    hasMultipleFiles: function() {
      const files = propOr([], 'files', this.item)
      return files.length > 1
    },

    size: function() {
      return this._computeStorageMetrics(this.item.groupSize)
    },

    totalProgress: function() {
      return this._computeStorageMetrics(this.totalUploaded)
    },

    /**
     * Compute if the package has a warning from the preview endpoint
     * @returns {Boolean}
     */
    hasWarning: function() {
      const warnings = propOr([], 'warnings', this.item)
      return warnings.length > 0
    },

    /**
     * Compute the warning message to display to the user
     * @returns {String}
     */
    warningMessage: function() {
      return compose (
        join(' '),
        flatten(),
        propOr([], 'warnings')
      )(this.item)
    }
  },

  watch: {
    /**
     * Watch item and calculate uploading total
     */
    item: {
      /**
       * @param {Object} item
       */
      handler: function(item) {
        if (this.submitted) {
          let totalUploaded = 0
          item.files.forEach(file => {
            totalUploaded += propOr(0, 'totalUploaded', file)
          });

          this.totalUploaded = totalUploaded
          EventBus.$emit('total-uploaded', {
            total: this.totalUploaded,
            name: item.packageName
          })

          if (totalUploaded > 0) {
            this.uploading = true
          }
        }
      },
      deep: true
    }
  },

  methods: {
    /**
     * Remove package from fileList
     */
    removePackage: function () {
      this.$emit('remove-package', this.item)
    },

    toggleFiles: function () {
      if (this.hasMultipleFiles) {
        this.showFiles = !this.showFiles
        this.$emit('toggle-files')
      }
    },

    /**
     * computes display value for raw metric data
     * @param {Number} groupSize
     * @returns {String}
     */
    _computeStorageMetrics: function(groupSize) {
      // user may not have permissions to view metrics on some datasets
      if (!groupSize) {
        return 0
      }
      return this.formatMetric(groupSize)
    },

    /**
     * Get icon from type
     * @param {String} type
     */
    /* eslint-disable complexity */
    getIcon: function (type) {
      switch (type) {
        case 'Collection':
        case 'DataSet':
          return 'folder'
        case 'PDF':
        case 'PYTHON':
        case 'R':
        case 'Text':
        case 'TimeSeries':
        case 'Video':
        case 'MRI':
        case 'Tabular':
        case 'Image':
          return type
        case 'Slide':
          return 'microscope'
        case 'CSV':
          return 'tabular'
        default:
          return 'file'
      }
    },
    /* eslint-disable complexity */

    /**
     * Handle file click
     * @param {Object} file
     */
    handleFileClick: function(file) {
      const pkgId = pathOr('', ['package', 'content', 'id'], file)
      const destination = propOr('', 'uploadDestination', file)

      const route = { query: { pkgId } }
      if (destination.packageType === 'DataSet') {
        route.name = 'dataset-files'
        EventBus.$emit('close-uploader')
        this.$router.push(route)
      } else {
        route.name = 'collection-files'
        route.params = { fileId: destination.id }
        EventBus.$emit('close-uploader')
        this.$router.push(route)
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../../assets/_variables.scss';
@import '../../../assets/_icon-item-colors.scss';

.bf-upload-package {
  border: 1px solid $cortex;
  border-top: none;
  &:first-child {
    border-top: 1px solid $cortex;
  }
  .overflow &:last-child {
    border-bottom: none;
    border-top: none;
  }
  .overflow &:first-child {
    border-top: none;
  }
  &.is-uploading {
    .package-info {
      flex: 1;
    }
  }
  .svg-icon {
    height: 24px;
    width: 24px;
  }
  &.is-uploaded {
    background: #EFF1F3;
  }
  .path-info, .package-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap
  }
}
.bf-upload-package-wrap {
  align-items: center;
  display: flex;
  flex-direction: row;
  padding: 13px 10px 13px 20px;
  position: relative;
  z-index: 1;
}
.package-name {
  flex: 1;
  a {
    cursor: pointer;
  }
}
.icon-package {
  margin-right: 7px;
}
.icon-remove {
  color: $light-gray;
  cursor: pointer;
  height: 18px;
  margin: -5px -5px -5px 1px;
  width: 18px;
  &:hover {
    color: $synapse
  }
}
.package-info {
  color: $glial;
  text-align: right;
  width: 110px;
}
.status {
  text-transform: capitalize
}
.package-size, .package-progress {
  font-size: 12px;
  text-transform: uppercase;
}
.package-progress {
  display: inline;
  span {
    text-transform: none;
  }
}
.bf-progress-bar.package-progress-bar {
  background: transparent;
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
  .bar {
    background: #F0F0F0;
  }
}
.bf-upload-file-wrap {
  border-top: 1px solid $cortex;
}
.icon-expand {
  cursor: pointer;
  height: 18px;
  left: 3px;
  position: absolute;
  width: 18px;
}
.icon-waiting {
  color: $app-primary-color;
  padding: 3px;
}
.unavailable-throbber {
  padding: 0;
  margin-bottom: -3px;
  margin-left: 5px;
}
.vue-tooltip {
  z-index: 1000
}
.package-warning, .package-error {
  font-size: 13px;
  padding: 10px 10px 10px 18px;
  position: relative;
  &:before {
    background: $glial;
    content: '';
    display: block;
    height: calc(100% + 1px);
    left: 0px;
    position: absolute;
    top: 0;
    width: 8px;
    z-index: 1;
  }
}

.package-error {
  strong {
    color: $error-color;
  }
}
.tooltip-upload {
  max-width: 200px;
  word-break: break-all;
}
</style>
