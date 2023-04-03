<template>
  <bf-page v-show=true class="file-meta-data-info">

    <div class="header">
        Details
    </div>

    <template v-if="singleFileSelected">
      <div class="file-info">
        <div class="key-value">
          <div class="label">Name:</div>
          <div class="value">{{getFileInfo.Name}}</div>
        </div>
        <div class="key-value">
          <div class="label">Size:</div>
          <div class="value">{{getFileInfo.Size}}</div>
        </div>
        <div class="key-value">
          <div class="label">Where:</div>
          <div class="value">{{getFileInfo.Where}}</div>
        </div>
        <div class="key-value">
          <div class="label">Kind:</div>
          <div class="value">{{getFileInfo.Kind}}</div>
        </div>
        <div class="key-value">
          <div class="label">Created:</div>
          <div class="value">{{getFileInfo.CreatedAt}}</div>
        </div>
        <div class="key-value">
          <div class="label">Id:</div>
          <div class="value">{{getFileInfo.PackageId}}</div>
          <svg-icon
            icon="icon-annotation"
            class="copy-clipboard"
            width="24"
            height="24"
            @click="copyPackageIdToClipboard"
          />
        </div>
      </div>
      <div class="record-info"
           v-for="item in curPackageMetaData"
           :key="item.id">

        <div class="record-header">
          <div>
            {{ item.model }}
          </div>
          <el-popover
            placement="top-start"
            title="Information"
            width="260"
            trigger="hover"
            :content="getMessage(item.origin.node_id, item.model)">
              <svg-icon slot="reference"
                        icon="icon-info"
                        width="14"
                        height="14"
              />
          </el-popover>
        </div>

        <div class="record-props"
             v-for="(value,propertyName) in item.props"
             :key="value"
        >
          <div class="record-prop-item">
            <div class="prop-label">{{propertyName}}</div>
            <div>{{value}}</div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="file-info">
        <div class="simple-message">
          {{noDetailsMessage}}
        </div>

      </div>



    </template>


  </bf-page>
</template>

<script>
import EventBus from "../../../../utils/event-bus";
import { mapGetters,mapActions, mapState } from 'vuex'
import BfStorageMetrics from '../../../../mixins/bf-storage-metrics';
import FormatDate from '../../../../mixins/format-date'
import {
  compose,
  map,
  join,
  prepend,
  reverse,
} from 'ramda'



export default {
  name: 'FileMetadataInfo',

  components: {
  },

  mixins: [
    BfStorageMetrics,
    FormatDate
  ],

  props: {
    selectedFiles: {
      type: Array,
      default: () => []
    },
    ancestors: {
      type: Array,
      default: () => []
    },
    folderName: {
      type: String,
      default: () => ""
    }
  },

  data: function () {
    return {
    }
  },

  computed: {
    ...mapGetters([
      'userToken',
    ]),
    ...mapGetters('filesModule',[
      'curPackageMetaData',
    ]),

    fileLocation: function() {
      const ancestors = this.ancestors

      const path = compose(
        join('/'),
        prepend('Files'),
        map(ancestor => {
          return ancestor.content.name
        }),
        reverse()
      )(ancestors)



      return path + "/" + this.folderName
    },

    noDetailsMessage: function() {
      if (this.selectedFiles.length == 0) {
        return "No files selected"
      } else if (this.selectedFiles.length > 1) {
        return this.selectedFiles.length + " files selected"
      }
    },
    singleFileSelected: function() {
      return this.selectedFiles.length == 1
    },
    getFileInfo: function () {
      if(this.selectedFiles.length == 1) {
        console.log(this.selectedFiles[0].content.name)
        let result =  {
          'Name': this.selectedFiles[0].content.name,
          'Size': this.formatMetric(this.selectedFiles[0].storage),
          'Where': this.fileLocation,
          'Kind': this.selectedFiles[0].subtype,
          'CreatedAt': this.formatDate(this.selectedFiles[0].content.createdAt),
          'PackageId': this.selectedFiles[0].content.nodeId,
        }
        console.log(result)

        return result
      }
      else {
        return {}
      }



    },
  },

  watch: {
    selectedFiles(newSelectedFiles, oldQuestion) {
      if (newSelectedFiles.length == 1 ){
        this.fetchMetadataForPackage(newSelectedFiles[0].content.nodeId)
      }

    },
    // curPackageMetaData(newMetadata) {
    //   console.log("New Metadata")
    // }
  },

  mounted: function () {

  },

  destroyed: function () {

  },


  methods: {
    ...mapActions('filesModule', [
      'fetchMetadataForPackage',
    ]),
    getMessage(itemId, modelName) {
      // Get Folder Name
      var fName = ""

      if (this.selectedFiles[0].content.nodeId == itemId) {
        if (modelName == this.curPackageMetaData[0].model) {
          fName = "the selected file is directly associated with the"
        } else {
          fName = "the selected file is associated with a record hierarchically linked to "
        }
      } else {
        for (let i = 0; i < this.ancestors.length; i++) {
          if (this.ancestors[i].content.nodeId == itemId) {
            fName = "the folder with name '" + this.ancestors[i].content.name + "' is associated with the"
            break
          }
        }
      }




      return "You are seeing this because " + fName + modelName +" record."

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
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';


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
  margin: 4px 8px 4px 4px;

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
