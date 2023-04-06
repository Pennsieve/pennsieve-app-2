<template>
  <div class="deleted-files">
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
      <div class="bf-dataset-breadcrumbs">
        <!--ANCESTORS AREN'T AVAILABLE TO DELETED FILES. NEED TO TRACK PARENTS OF EACH FILE OR DIRECTORY-->
        <breadcrumb-navigation
          :ancestors="ancestorList"
          :file="file"
          :file-id="fileId"
          @navigate-breadcrumb="handleNavigateBreadcrumb"
        />
      </div>
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
import BfRafter from '../shared/bf-rafter/BfRafter.vue'
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
import { pathOr, propOr, isEmpty } from 'ramda';
export default {
name: 'DeletedFiles',
components: {
  BfButton,
  BfDialog,
  FilesTable,
  BfEmptyPageState,
  BfMoveDialog,
  BfRafter,
  BreadcrumbNavigation,
  BfDeleteDialog,
  PaginationPageMenu
},

mixins: [
  Sorter,
  Request,
  GetFileProperty
],

data: function(){
  return {
      file: {
        content: {
          name: ''
        }
      },
      selectedDeletedFiles: [],
      sortedDeletedFiles: [],
      files: [],
      isOpen: false,
      tableResultsTotalCount: 0,
      offset: 0,
      limit: 10,
      //page: 1,
      //full path, i.e. move destination for 'restore' operation
      origFilePath: '',
      ancestorList: []

  }
},

mounted: function(){
 EventBus.$on('fetchDeleted', () => {
   this.fetchDeletedFunc(this.offset,this.limit)
 })
 EventBus.$on('openDeletedModal', (data) => {
   this.file = {}
   this.ancestorList = []
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
  fileId() {
    return pathOr(propOr('', 'node_id', this.file), ['content', 'id'], this.file)
  },
  fileName() {
    return pathOr(propOr('', 'name', this.file), ['content', 'name'], this.file)
  }
},
methods: {
  /**
   * Get files URL for dataset
   * @returns {String}
   */
   getFilesUrl: function (root_node) {
    if (this.config.api2Url && this.userToken) {
      return root_node ? 
        `${this.config.api2Url}/datasets/trashcan?dataset_id=${this.$route.params.datasetId}&root_node_id=${root_node}&limit=${this.limit}&offset=${this.offset}` :
        `${this.config.api2Url}/datasets/trashcan?dataset_id=${this.$route.params.datasetId}&limit=${this.limit}&offset=${this.offset}`
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
    this.fetchDeletedFunc(this.offset,this.limit)
  },
  /**
   * Sort table by column
   * @param {String} path
   * @param {String} dir
   */
  sortColumn: function (path, dir = '') {
    this.sortedDeletedFiles = this.returnSort(path, this.files, dir)
  },
  /**
   * Remove items from files list
   * @param {Object} items
   */
  removeItems: function (items) {
    // Remove all successfully deleted files
    this.files.filter((value, index, arr) => {
      const file_node_id = propOr('', 'node_id', value)
      const item_file = items.find(item => item == file_node_id)
      if (item_file) {
        arr.splice(index, 1)
      }
    })

    this.file = {}
    this.ancestorList = []
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
    const packageType = pathOr('', ['content', 'packageType'], file)
    if (propOr('', 'node_id', file) === '') {
      return
    }

    if (packageType === 'Collection') {
      //If we click on a folder, we want to add that folder to the ancestors list
      if (this.fileId && this.fileName) {
        this.ancestorList.push({
          'content': {
            'id': this.fileId,
            'name': this.fileName
          }
        })
      }
      this.file = file
      this.navigateToFile(this.fileId)
    }
  },
   /**
     * Navigate to file
     * @param {String} id
     */
     navigateToFile: function (root_node) {
      //consider if there's another way to do this:
      this.fetchDeletedFunc(this.offset, this.limit, root_node)
    },
     /**
     * Handler for breadcrumb overflow navigation
     * @param {String} id
     */
     handleNavigateBreadcrumb: function (id = '') {
      if (!isEmpty(id)) {
        this.navigateToFile(id)
        let index = this.ancestorList.findIndex(item => item.content.id == id)
        if (index >= 0){
          this.file = this.ancestorList[index]
          if ((this.ancestorList.length - index - 1) > 0)
            this.ancestorList.splice(index, this.ancestorList.length - index - 1)
          else
            this.ancestorList.splice(0, this.ancestorList.length)
        }
      } else {
        this.ancestorList = []
        this.file = {}
        this.fetchDeletedFunc(this.offset,this.limit)
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
  /**
   * method moves selection(s) back to the datasets file storage (unmarked as deleted)
   * @param {String} destination}
   * @param {Array} items
   */
  moveBackToFiles: function () {
    const id = this.$route.name === 'dataset-files' ? this.$route.params.datasetId : this.$route.params.fileId
    const nodeIds = this.selectedDeletedFiles.map(item => item.node_id)
    const options = {
        method: 'POST',
        headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization:  `Bearer ${this.userToken}`
      },
      body: JSON.stringify({nodeIds})
    }
    fetch(`${this.config.api2Url}/packages/restore?dataset_id=${id}`, options)
      .then(response => {
        if (response.ok) {
          this.onRestoreItems(response.json())
        } else {
          throw response
        }
      })
      .catch(err => console.error(err))
  },

  //handler for restore items success
  onRestoreItems: async function(response){
    const data = await response
    const successItems = propOr([], 'success', data)
    const failureItems = propOr([], 'failures', data)
    if (failureItems.length > 0) {
      let failedFileNames = []
      failureItems.forEach(item => {
        const failedFile = this.selectedDeletedFiles.find(file => file.node_id == item.id)
        if (failedFile) {
          failedFileNames.push(failedFile.name)
        }
      })
      EventBus.$emit('toast', {
        detail: {
          msg: `There was an error restoring the following file(s): ${failedFileNames}`,
          type: 'error'
        }
      })
    }
    EventBus.$emit('refreshAfterRestore')
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
    const options = {method: 'GET', headers: {accept: 'application/json', authorization: `Bearer ${this.userToken}`}};
    var deleted_files_url = ''
    deleted_files_url = this.getFilesUrl(root_node) //this.sendxhr
    fetch(deleted_files_url, options)
      .then(response => {
        if (response.ok) {
          this.files = []
          response.json().then(data => {
            const packages = data.packages
            packages.forEach(file => {
              this.files.push({
                ...file,
                'content': {
                  'packageType': file.type,
                  'name': file.name.replace(`__DELETED__${file.node_id}_`, '')
                }
              })
            })
          })
        } else {
          throw response
        }
        this.sortedDeletedFiles = this.returnSort('content.name', this.files, this.sortDirection)

        const pkgId = pathOr('', ['query', 'pkgId'], this.$route)

        if (pkgId) {
          this.scrollToFile(pkgId)
        }
      })
      .catch(response => {
        this.handleXhrError(response)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
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
