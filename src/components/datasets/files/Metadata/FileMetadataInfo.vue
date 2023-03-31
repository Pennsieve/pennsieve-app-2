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
          <div class="label">Owner:</div>
          <div class="value">{{getFileInfo.CreatedBy}}</div>
        </div>
        <div class="key-value">
          <div class="label">Id:</div>
          <div class="value">{{getFileInfo.PackageId}}</div>
        </div>
      </div>
      <div class="record-info"
           v-for="item in curPackageMetaData"
           :key="item.id">

        <div class="record-header">
          {{ item.model }}
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
import { mapGetters,mapActions, mapState } from 'vuex'



export default {
  name: 'FileMetadataInfo',

  components: {
  },

  mixins: [
  ],

  props: {
    selectedFiles: {
      type: Array,
      default: () => []
    },
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
          'Size': this.selectedFiles[0].storage,
          'Where': "unknown",
          'Kind': this.selectedFiles[0].subtype,
          'CreatedAt': this.selectedFiles[0].content.createdAt,
          'CreatedBy':this.selectedFiles[0].content.ownerId,
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
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';


.file-meta-data-info {
  border: 1px solid $gray_2;
  width: 300px;
  margin-left: 16px;
  border-radius: 4px;
  flex: 0 0 280px;
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
    //margin: 0 8px;
    //padding: 8px;
    //padding-left: 8px;
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

.file-info {
  margin: 4px 4px;

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
