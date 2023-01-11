<template>
  <div
    class="deleted-files"
  >
    <bf-dialog
      :title="TEST: Files Staged for Permanent deletion "
      :open="open"
      @close="onClose"
      @overlay-click="onOverlayClick"
    >
      <div
        slot="body"
        class="bf-upload-body"
        @dragenter="setIsDragging(true)"
      >

              <files-table
                v-if="hasItems(fileListMap)"
                :data="files"
                :multiple-selected="multipleSelected"
                :within-delete-menu="true"
                :enable-download="false"
                @move="moveBackToFiles"
                @delete="showDelete"
                @process="deleteProcessFile"
                @copy-url="deleteGetPresignedUrl"
                @selection-change="deleteSetSelectedFiles"
                @click-file-label="onClickLabelDelete">
              </files-table>

              <!-- use this
              <files-table
                v-if="hasFiles"
                :data="files"
                :multiple-selected="multipleSelected"
                @move="showMove"
                @delete="showDelete"
                @process="processFile"
                @copy-url="getPresignedUrl"
                @selection-change="setSelectedFiles"
                @click-file-label="onClickLabel"
                -->
          </div>


        <bf-button
          class="secondary"
          @click="cancelModal"
        >
          Cancel
        </bf-button>

        <bf-button
          :disabled="fileListMap.size === 0"
          @click="removeFromTrash"
        >
          Remove from trash
        </bf-button>

        <bf-button
          class="secondary"
          @click="onClose"
        >
          Hide
        </bf-button>

    </bf-dialog>
  </div>
</template>

<script>
import EventBus from '../../../utils/event-bus'
import BfButton from '../../shared/bf-button/BfButton.vue'
import BfDialog from './BfDialog.vue'
import BfMoveDialog from './bf-move-dialog/BfMoveDialog.vue'
import BreadcrumbNavigation from './BreadcrumbNavigation/BreadcrumbNavigation.vue'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'
import FilesTable from '../../FilesTable/FilesTable.vue'

export default {
name: 'DeletedFiles',
components: {
  BfButton,
  BfDialog,
  FilesTable,
  BfEmptyPageState
},
data: function(){
  return {
      selectedDeletedFiles: [],
      files: []

  }
},

mounted: {
 EventBus.$on('fetchDeleted', (data) => {
   this.fetchDeletedFunc()
 })
},
computed: {
  ...mapGetters([
    'userToken',
    'config',
    'dataset',
    'filesProxyId'
  ]),

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
   * Close dialog callback
   */
  onClose: function() {
    //this.errorPreflight = ''
    //this.showInfo = false
    //this.modelId = ''
    //this.recordId = ''
    //want to refresh displayed files after upload executes
    //this.sendRefreshMessage()
    //this.clearUploadedFiles()
    this.$emit('close-deleted-dialog')
  },

  onOverlayClick: function() {
    this.$emit('close-deleted-dialog')
  },
  //deletes files permenantly
  showDelete: function(){
    const fileIds = this.selectedDeletedFiles.map(item => item.content.id)

    this.sendXhr(this.deleteUrl, {
      method: 'POST',
      body: { things: fileIds }
    })
    .then(response => {
      this.$emit('file-delete', response)
      //this.closeDialog()
    })
    .catch(response => {
      this.handleXhrError(response)
    })
  }
  },
  //method moves selection(s) back to the datasets file storage (unmarked as deleted)
  moveBackToFiles: function(){
    //make promise (where you call undelete endpoint), on return call fetch deleted again to get updated list.

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

//will fetch all files that are marked deleted for a given dataset
 fetchDeletedFunc: function() {
   console.log('calling again')
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
     })
     .catch(response => {
       this.handleXhrError(response)
     })
 }
}
}
</script>
<style src="./BfUpload.scss" scoped lang="scss"></style>
<style lang="scss">
  @import '../../assets/_variables.scss';
  .deleted-files .bf-dialog .bf-dialog-wrap {
    height: 590px;
    margin: -295px 0 0 -350px;
    width: 700px;
  }
</style>
