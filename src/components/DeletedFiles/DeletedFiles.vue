<template>
  <div
    class="deleted-files"
  >
  <bf-rafter slot="heading">
      <div
        slot="heading"
        class="bf-dataset-breadcrumbs"
      >
        <!--ANCESTORS AREN'T AVAILABLE TO DELETED FILES. NEED TO TRACK PARENTS OF EACH FILE OR DIRECTORY-->
        <breadcrumb-navigation
          :ancestors="ancestors"
          :file="file"
          :file-id="$route.params.fileId"
          @navigate-breadcrumb="handleNavigateBreadcrumb"
        />
      </div>
  </bf-rafter>
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
      <!--HERE we will add pagination header?? -->

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
        &nbsp;
        <files-table
          v-if="hasFiles"
          :data="files"
          :multiple-selected="multipleSelected"
          within-delete-menu
          :enable-download="false"
          @restore="moveBackToFiles"
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
    <!--
    <bf-delete-dialog
      ref="deleteDialog"
      calling-from-deleted
      :selected-files="selectedDeletedFiles"
      file-delete-2
      @file-delete="onDelete"
    /> -->
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
      //page: 1,
      //full path, i.e. move destination for 'restore' operation
      origFilePath: ''

  }
},

mounted: function(){
 EventBus.$on('fetchDeleted', () => {
   this.fetchDeletedFunc(this.offset,this.limit)
 })
 EventBus.$on('openDeletedModal', (data) => {
   this.isOpen = data;
 })
 //EventBus.$on()

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
},
methods: {
  /**
   * Get files URL for dataset
   * @returns {String}
   */
   getFilesUrl: function (root_node) {
    if (this.config.api2Url && this.userToken) {
      //const baseUrl = this.$route.name === 'dataset-files' ? 'datasets' : 'packages'
      const id = this.$route.name === 'dataset-files' ? this.$route.params.datasetId : this.$route.params.fileId
      //PAGE BREAKS WHEN BELOW EXECUTES ??
      return `${this.config.api2Url}/datasets/trashcan?dataset_id=${id}&limit=${this.limit}&offset=${this.offset}`
    }
    if (this.config.api2Url && this.userToken && root_node){
      const id = this.$route.name === 'dataset-files' ? this.$route.params.datasetId : this.$route.params.fileId
      return `${this.config.api2Url}/datasets/trashcan?dataset_id=${id}&root_node_id=${root_node}&limit=${this.limit}&offset=${this.offset}`
    }
  },
  /**
     * Scroll to file in list
     * @param {String} pkgId
     */
     scrollToFile: function (pkgId) {
      this.$nextTick(() => {
        const trimmedId = pkgId.replace(/:/g, '')
        const element = document.querySelectorAll(`.file-row-${trimmedId}`)

        if (element.length) {
          head(element).scrollIntoView()

          element.forEach(row => {
            row.classList.add('highlight')

            setTimeout(() => {
              row.classList.remove('highlight')
            }, 500)
          })
        }
      })
    },
  /**
   * Update pagination offset
   */
  onPaginationPageChange: async function(page) {
    //currFileSearchPage
    const offset = (page - 1) * this.limit
    this.offset = offset
    //NOTE: should pass offset and page into fetchDeleted
    this.fetchDeletedFunc(this.offset,this.limit,root_node)
    
  },
  /**
   * Reset selected files state
   */
  resetSelectedFiles: function () {
    this.selectedDeletedFiles = []
    this.lastSelectedFile = {}
    this.fetchDeletedFunc(this.offset,this.limit,root_node)
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
   * Handler for clicking file. Allows one to drill down into deleted package
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
     * Navigate to file
     * @param {String} id
     */
     navigateToFile: function (id) {
      this.$router.push({name: 'collection-files', params: {fileId: id}})
      root_node = id
      //consider if there's another way to do this:
      this.fetchDeletedFunc(this.offset,this.limit,root_node)
    },
     /**
     * Handler for breadcrumb overflow navigation
     * @param {String} id
     */
     handleNavigateBreadcrumb: function (id = '') {
      if (id) {
        this.navigateToFile(id)
      } else {
        this.navigateToDataset()
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
      this.fetchDeletedFunc(this.offset,this.limit,root_node)
    })
    .catch(response => {
      this.handleXhrError(response)
    })
  },
  //method moves selection(s) back to the datasets file storage (unmarked as deleted)
  moveBackToFiles: async function() {
      console.log("MOVING FILES STAGED FOR DELETION BACK TO PARENT DIRECTORY")
  try {
    //const move_response1 = await fetch('moveEndpoint');
    if (response1.ok) {
      await this.fetchDeletedFunc(this.offset,this.limit,root_node);
      console.log('files moved back to original directory');
    } else {
      console.error('Error calling endpoint:', move_response.status);
    }
  } catch (error) {
    console.error(error);
  }
},

    /**
     * method moves selection(s) back to the datasets file storage (unmarked as deleted)
     * @param {String} destination}
     * @param {Array} items
     */
     moveItems: function (destination, items) {
    const id = this.$route.name === 'dataset-files' ? this.$route.params.datasetId : this.$route.params.fileId
    const nodeIds = items.map(item => item.content.id)
    const options = {
    method: 'POST',
    headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization:  `Bearer ${this.userToken}`
  },
  body: JSON.stringify({nodeIds})
};
fetch(`${this.config.api2Url}/packages/restore?dataset_id=${id}`, options)
  .then(response => response.json())
  .then(response => console.log(response))
  //response is {"success": array of strings, "failures": array of objects}
  .then(onRestoreItems(response))
  .catch(err => console.error(err));
  },

  //handler for restore items success
  onRestoreItems: function(response){
  const successItems = propOr([], 'success', response)
  this.removeItems(successItems)
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
Will fetch all files that are marked deleted for a given dataset.
RETURNS: {"limit":50,"offset":0,"totalCount":0,"packages":null,"messages":["..."]}
request limit defaults to 10 and must be < 100. offset defaults to 0
path field is empty
Need to reach into packages list instead of pulling stuff from url
*/
 fetchDeletedFunc: function(offset, limit, root_node = undefined) {
  //NOTE: we will  want to make sure that this isnt a flat map
  const options = {method: 'GET', headers: {accept: 'application/json', Authorization: `${this.userToken}`}};
   console.log('fetching deleted files')
   var deleted_files_url = ''
   if (root_node) {
    deleted_files_url = this.getFilesUrl(root_node) //this.sendxhr
   }
   else {
    deleted_files_url = this.getFilesUrl() //this.sendxhr
   }
   fetch(deleted_files_url, options)
     .then(
      //check if syntax error
      //response => response.json(),
      response => {
       this.file = response
       console.log("RESPONSE OBJECT IS ",this.file)
       this.tableResultsTotalCount = this.file.totalCount
       console.log("TOTAL COUNT IS ", this.tableResultsTotalCount)
       this.files = response.packages.node_id.map(file => {
         if (!file.storage) {
           file.storage = 0
         }
         //NO ICON FOR NOW
         //file.icon = file.icon || this.getFilePropertyVal(file.properties, 'icon')
         //file.subtype = this.getSubType(file)
         return file
       })
       this.sortedFiles = this.returnSort('content.name', this.files, this.sortDirection)
       //DISABLE ANCESTORS FOR NOW 
       //this.ancestors = response.ancestors

       const pkgId = pathOr('', ['query', 'pkgId'], this.$route)
       //const pkgId = file
       if (pkgId) {
         this.scrollToFile(pkgId)
       }
       //this.tableResultsTotalCount = this.files.length
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
