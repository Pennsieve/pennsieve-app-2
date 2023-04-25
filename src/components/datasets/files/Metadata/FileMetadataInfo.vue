<template>
  <bf-page v-show="true">
    <div class="actions-container">
      <div class="header">Actions</div>
      <button
        class="undelete-button actions-item-container"
        @click="NavToDeleted"
      >
        <svg-icon class="mr-8" icon="icon-trash" height="22" width="22" />
        <div>Restore Deleted</div>
      </button>
    </div>
    <div class="file-meta-data-info">
      <div class="header"><div>Details</div></div>
      <template v-if="showFileFolderInfo">
        <div class="file-info">
          <div class="key-value">
            <div class="label">Name:</div>
            <div class="value">{{ getFileInfo.Name }}</div>
          </div>
          <div class="key-value">
            <div class="label">Size:</div>
            <div class="value">{{ getFileInfo.Size }}</div>
          </div>
          <div class="key-value">
            <div class="label">Where:</div>
            <div class="value">{{ getFileInfo.Where }}</div>
          </div>
          <div class="key-value">
            <div class="label">Kind:</div>
            <div class="value">{{ getFileInfo.Kind }}</div>
          </div>
          <div class="key-value">
            <div class="label">Created:</div>
            <div class="value">{{ getFileInfo.CreatedAt }}</div>
          </div>
          <div class="key-value">
            <div class="label">Id:</div>
            <div class="value">{{ getFileInfo.PackageId }}</div>
            <svg-icon
              icon="icon-annotation"
              class="copy-clipboard"
              width="28"
              height="28"
              @click="copyPackageIdToClipboard"
            />
          </div>
        </div>
        <div
          class="record-info"
          v-for="item in curPackageMetaData"
          :key="item.id"
        >
          <div class="record-header">
            <div>{{ item.model }}</div>
            <el-popover
              placement="top-start"
              title="Information"
              width="260"
              trigger="hover"
              :content="getMessage(item.origin.node_id, item.model)"
            >
              <svg-icon
                slot="reference"
                icon="icon-info"
                width="14"
                height="14"
              />
            </el-popover>
          </div>

          <div
            class="record-props"
            v-for="(value, propertyName) in item.props"
            :key="value"
          >
            <div class="record-prop-item">
              <div class="prop-label">{{ propertyName }}</div>
              <div>{{ value }}</div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="showDatasetInfo">
        <div class="key-value">
          <div class="label">Name:</div>
          <div class="value">{{ getDatasetInfo.Name }}</div>
        </div>
        <div class="key-value">
          <div class="label">Size:</div>
          <div class="value">{{ getDatasetInfo.Size }}</div>
        </div>
        <div class="key-value">
          <div class="label">Where:</div>
          <div class="value">{{ getDatasetInfo.Where }}</div>
        </div>
        <div class="key-value">
          <div class="label">Kind:</div>
          <div class="value">{{ getDatasetInfo.Kind }}</div>
        </div>
        <div class="key-value">
          <div class="label">Created:</div>
          <div class="value">{{ getDatasetInfo.CreatedAt }}</div>
        </div>

        <div class="dataset-info">
          This is the root folder of the '{{ folder.content.name }}' dataset.
        </div>
      </template>

      <template v-else>
        <div class="file-info">
          <div class="simple-message">{{ noDetailsMessage }}</div>
        </div>
      </template>
    </div>
  </bf-page>
</template>

<script>
import EventBus from '../../../../utils/event-bus'
import { mapGetters, mapActions, mapState } from 'vuex'
import BfStorageMetrics from '../../../../mixins/bf-storage-metrics'
import FormatDate from '../../../../mixins/format-date'
import { compose, map, join, prepend, reverse } from 'ramda'

export default {
  name: 'FileMetadataInfo',

  components: {},

  mixins: [BfStorageMetrics, FormatDate],

  props: {
    selectedFiles: {
      type: Array,
      default: () => []
    },
    ancestors: {
      type: Array,
      default: () => []
    },
    folder: {
      type: Object,
      default: () => {}
    }
  },

  data: function() {
    return {}
  },

  computed: {
    ...mapGetters(['userToken']),
    ...mapGetters('filesModule', ['curPackageMetaData']),

    fileLocation: function() {
      const ancestors = this.folder.ancestors
      const rootNode = 'Files'

      window.relatives = ancestors
      let path = rootNode
      if (this.folder.ancestors && ancestors.length > 0) {
        path = compose(
          join('/'),
          prepend(rootNode),
          map(ancestor => {
            return ancestor.content.name
          }),
          reverse()
        )(ancestors)
      }

      return path + '/' + this.folder.content.name
    },

    noDetailsMessage: function() {
      if (this.selectedFiles.length == 0) {
        if (
          this.folder.content.packageType &&
          this.folder.content.packageType == 'DataSet'
        ) {
          return 'This is the root folder of the dataset'
        }
        return 'No files selected'
      } else if (this.selectedFiles.length > 1) {
        return this.selectedFiles.length + ' files selected'
      }
    },
    showDatasetInfo: function() {
      return (
        this.folder.content.packageType &&
        this.folder.content.packageType == 'DataSet'
      )
    },
    singleFileSelected: function() {
      return this.selectedFiles.length == 1
    },
    showFileFolderInfo: function() {
      return (
        (this.selectedFiles.length == 1 || this.selectedFiles.length == 0) &&
        this.folder.content.packageType &&
        this.folder.content.packageType != 'DataSet'
      )
    },
    getDatasetInfo: function() {
      if (
        this.folder.content.packageType &&
        this.folder.content.packageType == 'DataSet'
      ) {
        return {
          Name: '/',
          Size: this.formatMetric(this.folder.storage),
          Where: '/',
          Kind: 'Folder',
          CreatedAt: this.formatDate(this.folder.content.createdAt)
        }
      }
    },
    getFileInfo: function() {
      let result
      if (this.selectedFiles.length == 1) {
        result = {
          Name: this.selectedFiles[0].content.name,
          Size: this.formatMetric(this.selectedFiles[0].storage),
          Where: this.fileLocation,
          Kind: this.selectedFiles[0].subtype,
          CreatedAt: this.formatDate(this.selectedFiles[0].content.createdAt),
          PackageId: this.selectedFiles[0].content.nodeId
        }
        return result
      } else if (this.selectedFiles.length == 0) {
        if (this.folder.content.name != '') {
          result = {
            Name: this.folder.content.name,
            Size: this.formatMetric(this.folder.storage),
            Where: this.fileLocation,
            Kind: 'Folder',
            CreatedAt: this.formatDate(this.folder.content.createdAt),
            PackageId: this.folder.content.nodeId
          }
        } else {
          result = {
            Name: '/',
            Size: '',
            Where: '/',
            Kind: 'Folder',
            CreatedAt: '',
            PackageId: ''
          }
        }
        return result
      } else {
        return {}
      }
    },
    currentRouteName: function() {
      return this.$route.name
    },
    onFilesPage: function() {
      let filesTable = ['dataset-files', 'collection-files']
      if (filesTable.includes(this.currentRouteName)) {
        return true
      } else {
        return false
      }
    }
  },

  watch: {
    selectedFiles(newSelectedFiles, oldQuestion) {
      if (newSelectedFiles.length == 1) {
        this.fetchMetadataForPackage(newSelectedFiles[0].content.nodeId)
      } else if (newSelectedFiles.length == 0) {
        this.fetchMetadataForPackage(this.folder.content.id)
      }
    }
  },

  mounted: function() {},

  destroyed: function() {},

  methods: {
    ...mapActions('filesModule', ['fetchMetadataForPackage']),
    getMessage(itemId, modelName) {
      // Get Folder Name
      var fName = ''
      var curNodeId = ''
      if (this.singleFileSelected) {
        curNodeId = this.selectedFiles[0].content.nodeId
      } else {
        curNodeId = this.folder.content.id
      }

      if (curNodeId == itemId) {
        if (modelName == this.curPackageMetaData[0].model) {
          fName =
            "the selected file is directly associated with the '" +
            modelName +
            "' record."
        } else {
          fName =
            "the selected file is associated with a record which is has the '" +
            modelName +
            "' record as its parent."
        }
      } else if (this.folder.content.id == itemId) {
        fName =
          "the current folder is directly associated with the '" +
          modelName +
          "' record."
      } else {
        for (let i = 0; i < this.ancestors.length; i++) {
          if (this.ancestors[i].content.nodeId == itemId) {
            fName =
              "the parent folder '" +
              this.ancestors[i].content.name +
              "' is associated with the '" +
              modelName +
              "' record."
            break
          }
        }
      }

      return 'You are seeing this because ' + fName

      // return "You are seeing this metadata record because the folder '/d/ad//asd' is associated with the hopsital record."
    },
    copyPackageIdToClipboard(evt) {
      this.$clipboard(this.selectedFiles[0].content.nodeId)
      EventBus.$emit('toast', {
        detail: {
          type: 'success',
          msg: 'The package ID was copied to the clipboard'
        }
      })
    },
    //Navigates to dataset trash bin modal
    NavToDeleted: function() {
      //CONSIDER DOING SOMETHING LIKE FETCHFILES()
      EventBus.$emit('openDeletedModal', true)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';

.dataset-info {
  margin: 8px;
  font-size: 12px;
}

.undelete-button {
  padding: 10px;
}

.no-margin {
  margin: 0px;
}

.plus-icon {
  margin-left: -6px;
  margin-top: -10px;
  margin-bottom: -10px;
}

.undelete-button-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.actions-container {
  border: 1px solid $gray_2;
  margin-left: 16px;
  border-radius: 4px;
  margin-bottom: 10px;
  max-width: 260px;
  overflow-wrap: anywhere;
}

.actions-item-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  &:hover {
    color: $purple_1;
  }
}

.file-meta-data-info {
  border: 1px solid $gray_2;
  margin-left: 16px;
  border-radius: 4px;
  flex: 0 0 260px;
  max-width: 260px;
  overflow-wrap: anywhere;
}

.header {
  height: 38px;
  font-size: 16px;
  background-color: $gray_1;
  border-bottom: 1px solid $gray_2;
  line-height: 38px;
  padding-left: 16px;
  color: $gray_4;
}

.record-info {
  padding-left: 8px;
  margin: 0 8px 16px 4px;

  .record-header {
    color: $purple_1;
    background: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid $gray_2;
  }

  .record-props {
    font-size: 12px;
    //margin: 0 16px 16px 16px;

    .record-prop-item {
      border-top: 1px solid $gray_1;
      font-weight: 500;

      .prop-label {
        font-weight: 300;
      }
    }
  }
}

.copy-clipboard {
  align-self: center;
  color: $purple_1;
  cursor: pointer;
}
.file-info {
  margin: 4px 8px 24px 4px;

  .simple-message {
    padding: 8px;
  }
}
.key-value {
  display: flex;
  flex-direction: row;
  margin-left: 8px;
  margin-top: 4px;

  .label {
    font-weight: 300;
    min-width: 50px;
    font-size: 12px;
    color: $gray_5;
  }

  .value {
    margin-left: 8px;
    font-size: 12px;
    color: $gray_5;
  }
}
</style>
