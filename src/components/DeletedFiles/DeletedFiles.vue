<template>
  <div
    class="deleted-files"
  >
    <bf-dialog
      :title="dialogTitle"
      :open="isOpen"
      @close="onClose"
      @overlay-click="onOverlayClick"
    >
    <div>
      <p>deleted permanently after 30 days.</p>
    </div>

      <div
        slot="body"
        class="bf-upload-body"
      >
      <!--HERE we will add pagination header -->

      <div class="file-pagination">
          <div>
            <pagination-page-menu
              class="mr-24"
              :page-size="100"
            />
          </div>
          <el-pagination
            :page-size="100"
            :pager-count="5"
            :current-page="curFileSearchPage"
            layout="prev, pager, next"
            :total="tableResultsTotalCount"
            @current-change="onPaginationPageChange"
          />
        </div>
        <!-- END pagination -->
        &nbsp;
        <files-table
          v-if="hasFiles"
          :data="files"
          :multiple-selected="multipleSelected"
          within-delete-menu
          :enable-download="false"
          @move="moveBackToFiles"
          @delete="showDelete2"
          @selection-change="deleteSetSelectedFiles"
          @click-file-label="onClickLabelDelete">
        </files-table>
      </div>

      <div
        slot="footer"
      >
        <!--
        <bf-button
          class="secondary"
          @click="cancelModal"
        >
          Cancel
        </bf-button>
        <bf-button
          :disabled="files.size === 0"
          @click="moveBackToFiles"
        >
          Remove from trash
        </bf-button>
        -->
        <bf-button
          class="secondary"
          @click="onClose"
        >
          Close
        </bf-button>
      </div>
    </bf-dialog>
    <bf-delete-dialog
      ref="deleteDialog"
      calling-from-deleted
      :selected-files="selectedDeletedFiles"
      <!-- file-delete-2 -->
      @file-delete="onDelete"
    />
  </div>
</template>

<script>
import EventBus from '../../utils/event-bus'
import BfButton from '../shared/bf-button/BfButton.vue'
import BfDialog from '../shared/bf-dialog/bf-dialog.vue'
import BfMoveDialog from '../datasets/files/bf-move-dialog/BfMoveDialog.vue'
import BreadcrumbNavigation from '../datasets/files/BreadcrumbNavigation/BreadcrumbNavigation.vue'
import BfEmptyPageState from '../shared/bf-empty-page-state/BfEmptyPageState.vue'
import FilesTable from '../FilesTable/FilesTable.vue'
import Request from '../../mixins/request/index';
import Sorter from '../../mixins/sorter/index';
import GetFileProperty from '../../mixins/get-file-property';
import BfDeleteDialog from '../datasets/files/bf-delete-dialog/BfDeleteDialog.vue'
import PaginationPageMenu from '../shared/PaginationPageMenu/PaginationPageMenu.vue'
import { mapGetters } from 'vuex';
import { pathOr } from 'ramda';
export default {
name: 'DeletedFiles',
components: {
  BfButton,
  BfDialog,
  FilesTable,
  BfEmptyPageState,
  BfMoveDialog,
  BreadcrumbNavigation,
  BfDeleteDialog
},

mixins: [
  Sorter,
  Request,
  GetFileProperty
],

data: function(){
  return {
      selectedDeletedFiles: [],
      files: [],
      isOpen: false,
      tableResultsTotalCount: 0,
      offset: 0,
      limit: 10,
      page: 1

  }
},

mounted: function(){
 EventBus.$on('fetchDeleted', (data) => {
   this.fetchDeletedFunc()
 })
 EventBus.$on('openDeletedModal', (data) => {
   this.isOpen = data;
 })
 EventBus.$on()

 //EventBus.$on('fetchDeleted', this.fetchDeletedFunc())
},
computed: {
  ...mapGetters([
    'userToken',
    'config',
    'dataset',
    'filesProxyId'
  ]),
  //
  curFileSearchPage: function() {
    return this.offset / this.limit + 1
  },

  /**
   * Item has files
   */
  hasFiles: function () {
    return this.files.length > 0
  },

  dialogTitle: function() {
    return  'Deleted Files (deleted permanently after 30 days)'
  },

  /**
   * Computes form URL based on type of action user is taking (rename vs creating)
   * @returns {String}
   */
  deleteUrl: function() {
    if (this.config.apiUrl && this.userToken) {
      return `${this.config.apiUrl}/data/delete?api_key=${this.userToken}`
    }
  },

  /**
   * Compute if multiple files are selected
   * @returns {Boolean}
   */
  multipleSelected: function () {
    return this.selectedDeletedFiles.length > 1
  },
  /**
   * Get files URL for dataset
   * @returns {String}
   */
  getFilesUrl: function () {
    if (this.config.apiUrl && this.userToken) {
      const baseUrl = this.$route.name === 'dataset-files' ? 'datasets' : 'packages'
      const id = this.$route.name === 'dataset-files' ? this.$route.params.datasetId : this.$route.params.fileId

      return `${this.config.apiUrl}/${baseUrl}/${id}?api_key=${this.userToken}&includeAncestors=true`
    }
  },
},
methods: {
  /**
   * Update pagination offset
   */
  onPaginationPageChange: async function(page) {
    //note... need to find a way to change the page (just use 'page')
    this.offset = (this.page - 1) * this.limit
    //NOTE: should pass offset and page into fetchDeleted
    await this.fetchDeletedFunc(this.offset,this.limit)
  },
  /**
   * Reset selected files state
   */
  resetSelectedFiles: function () {
    this.selectedDeletedFiles = []
    this.lastSelectedFile = {}
  },
  /**
   * Sort table by column
   * @param {String} path
   * @param {String} dir
   */
  sortColumn: function (path, dir = '') {
    this.sortedFiles = this.returnSort(path, this.files, dir)
  },
  /**
   * Remove items from files list
   * @param {Object} items
   */
  removeItems: function (items) {
    // Remove all successfully deleted files
    for (let i = 0; i < items.length; i++) {
      const fileIndex = findIndex(pathEq(['content', 'id'], items[i]), this.files)
      this.files.splice(fileIndex, 1)
    }

    // Resort files
    this.sortColumn(this.sortBy, this.sortDirection)
    this.resetSelectedFiles()
  },
  /**
   * Handler for delete XHR
   */
  onDelete: function (response) {
    const successItems = propOr([], 'success', response)
    this.removeItems(successItems)
  },
  cancelModal: function() {
    this.onClose()
  },
  /**
   * Handler for clicking file
   * @param {Object} file
   */
  onClickLabelDelete: function (file) {
    const id = pathOr('', ['content', 'id'], file)
    const packageType = pathOr('', ['content', 'packageType'], file)

    if (id === '') {
      return
    }

    if (packageType === 'Collection') {
      this.navigateToFile(id)
    } else {
      this.$router.push({
        name: 'file-record',
        params: {
          conceptId: this.filesProxyId,
          instanceId: id
        }
      })
    }
  },
  /**
   * Close dialog callback
   */
  onClose: function() {
    this.isOpen = false
    EventBus.$emit('refreshAfterDeleteModal',true)
  },

  onOverlayClick: function() {
    this.onClose()
  },
  /**
   * Show delete dialog
   */
  showDelete2: function () {
    this.$refs.deleteDialog.visible = true
  },
  //deletes files permenantly. NOTE: should have toast message that confirms
  showDelete: function(){
    console.log("DELETING PERMANENTLY")
    const fileIds = this.selectedDeletedFiles.map(item => item.content.id)

    this.sendXhr(this.deleteUrl, {
      method: 'POST',
      body: { things: fileIds }
    })
    .then(response => {
      this.$emit('file-delete', response)
      const msg = 'File(s) permanently deleted.'
      EventBus.$emit('toast', {
        detail: {
          type: 'success',
          msg
        }
      })
      this.fetchDeletedFunc()
    })
    .catch(response => {
      this.handleXhrError(response)
    })
  },
  //method moves selection(s) back to the datasets file storage (unmarked as deleted)
  moveBackToFiles: function(){
    console.log("MOVING FILES STAGED FOR DELETION BACK TO PARENT DIRECTORY")
    let undeleteFilesMove = new Promise(function(resolve, reject) {
      let req = //call new endpoint
      if (req.status == 200) {
        EventBus.$emit('toast', {
          detail: {
            type: 'success',
            msg: 'File(s) moved back to parent directory.'
          }
        })
        resolve(req.response);
      } else {
        reject("Error")
      }
    });
    undeleteFilesMove.then(
        function(value) {this.fetchDeletedFunc(this.limit,this.offset)},
        function(error) {console.error(err);}
      );
    },
  /**
   * Set selected files
   * @param {Array} selection
   */
  deleteSetSelectedFiles: function (selection) {
    this.selectedDeletedFiles = selection
  },
  /**
   * Set subtype of file, defaulting to package type
   * @param {Object} file
   * @returns {String}
   */
  getSubType: function (file) {
    const subtype = this.getFilePropertyVal(file.properties, 'subtype')

    let defaultType = ''
    const packageType = pathOr('', ['content', 'packageType'], file)
    switch (packageType) {
      case 'Collection':
        defaultType = 'Folder'
        break
      case 'ExternalFile':
        defaultType = 'External File'
        break
      default:
        break
    }

    return subtype
      ? subtype
      : defaultType
  },

/*
Will fetch all files that are marked deleted for a given dataset. Need proper API endpoints
and need to provide limit and offset in request (getFilesUrl)
*/
 fetchDeletedFunc: function(offset, limit) {
   console.log('fetching deleted files')
   this.sendXhr(this.getFilesUrl)
     .then(response => {
       this.file = response
       this.files = response.children.map(file => {
         if (!file.storage) {
           file.storage = 0
         }
         file.icon = file.icon || this.getFilePropertyVal(file.properties, 'icon')
         file.subtype = this.getSubType(file)
         return file
       })
       this.sortedFiles = this.returnSort('content.name', this.files, this.sortDirection)
       this.ancestors = response.ancestors

       const pkgId = pathOr('', ['query', 'pkgId'], this.$route)
       if (pkgId) {
         this.scrollToFile(pkgId)
       }
       this.tableResultsTotalCount = this.files.length
     })
     .catch(response => {
       this.handleXhrError(response)
     })
 }
}
}
</script>
<style src="../BfUpload/BfUpload.scss" scoped lang="scss"></style>
<style lang="scss">
  @import '../../assets/_variables.scss';
  .deleted-files .bf-dialog .bf-dialog-wrap {
    height: 700px;
    margin: -295px 0 0 -350px;
    width: 700px;
  }
  bf-upload-body {
    height: 200px;
    overflow-y: auto;
  }

</style>
