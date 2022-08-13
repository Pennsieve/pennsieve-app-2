<template>
  <div class="file-container">
    <div class="table-header">
      <el-row
        type="flex"
        align="middle"
        :gutter="40"
      >
        <el-col
          :sm="20"
          class="info"
        >
          File
        </el-col>
        <el-col
          :sm="8"
        >
          File Type
        </el-col>
        <el-col
          :sm="12"
        >
          <manifest-status-menu
            :status-filter="statusFilter"
            @update-status-filter="updateStatusFilter"
          />
        </el-col>
        <el-col
          :sm="8"
        >
        </el-col>
      </el-row>
    </div>
    <div class>
      <upload-manifest-file
        v-for="file in this.manifestFiles.files"
        :key="file.id"
        class="bf-table-row"
        :item="file"
      />
    </div>
    <div
      class="no-files"
      v-if="hasNoItems">
      No files in selected status
    </div>
    <div
      class="load-more"
      v-if="hasMoreItems"
      @click=loadMore>
      Load more items...
    </div>
  </div>
</template>

<script>

import {mapGetters} from "vuex";
import Request from "../../../../mixins/request";
import UploadManifestFile from "./UploadManifestFile.vue"
import ManifestStatusMenu from "./ManifestFileFilterMenu";

export default {
  name: 'UploadManifestFiles',

  components: {
    ManifestStatusMenu,
    UploadManifestFile
  },

  mixins: [
    Request
  ],

  props: {
    item: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },

  data() {
    return {
      statusFilter: "All",
      manifestFiles: {
        type: Array
      }

    }
  },

  computed: {
    ...mapGetters([
      'activeOrganization',
      'userToken',
      'config',
    ]),

    hasNoItems: function() {
      return !this.manifestFiles.files
    },
    hasMoreItems: function(){
      return this.manifestFiles.files && this.manifestFiles.continuation_token.length > 0
    }

  },

  mounted: function() {
    this.loadFiles()
  },

  methods: {
    loadFiles: function() {
      // Get initial list of manifest files.
      const url = this.getManifestFilesUrl()
      if (!url) {
        return
      }
      const opts = {
        'header': {'Authorization': 'Bearer ' + this.userToken}
      }
      this.sendXhr(url, opts)
        .then(manifestFiles => {
          this.manifestFiles = manifestFiles
        })
        .catch(this.handleXhrError.bind(this))
    },
    loadMore: function() {
      let url = this.getManifestFilesUrl()
      url = url + `&continuation_token=${this.manifestFiles.continuation_token}`
      if (!url) {
        return
      }
      const opts = {
        'header': {'Authorization': 'Bearer ' + this.userToken}
      }
      this.sendXhr(url, opts)
        .then(manifestFiles => {
          this.manifestFiles.files = this.manifestFiles.files.concat(manifestFiles.files)
          this.manifestFiles.continuation_token = manifestFiles.continuation_token
        })
        .catch(this.handleXhrError.bind(this))


    },
    getManifestFilesUrl: function() {
      const pageLimit = 20
      if (!this.activeOrganization.organization || !this.userToken) {
        return
      }

      var url = `${this.config.api2Url}/manifest/files?api_key=${this.userToken}&manifest_id=${this.item.id}&limit=${pageLimit}`
      if (this.statusFilter != "All") {
        url = url + `&status=${this.statusFilter}`
      }

      return url
    },
    updateStatusFilter: function(event) {

      this.statusFilter =  event
      this.loadFiles()
    }
  }

}

</script>

<style lang="scss" scoped>
@import '../../../../assets/variables';

.file-container {
  margin-left: 40px;
}
.table-header {
  margin-top: 8px;
  background-color: $white;
  padding: 8px;
  font-weight: 500;
  border-bottom: 1px solid $gray_2;
}
.load-more {
  margin-left: 20px;
  cursor: pointer;
  color: $purple_2;
  margin-bottom: 8px;

}
.no-files {
  margin-left: 16px;
  margin: 8px;
}

</style>