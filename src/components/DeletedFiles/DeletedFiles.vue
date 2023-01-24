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
      <div
        slot="body"
        class="bf-upload-body"

      >

              <files-table
                v-if="hasFiles"
                :data="files"
                :multiple-selected="multipleSelected"
                :within-delete-menu="true"
                :enable-download="false"
                @move="moveBackToFiles"
                @delete="showDelete"
                @selection-change="deleteSetSelectedFiles"
                @click-file-label="onClickLabelDelete">
              </files-table>
            </div>


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
  BreadcrumbNavigation
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
      isOpen: false

  }
},

mounted: function(){

 EventBus.$on('fetchDeleted', (data) => {
   this.fetchDeletedFunc()
 })
 EventBus.$on('openDeletedModal', (data) => {
   this.isOpen = data;
 })

 //EventBus.$on('fetchDeleted', this.fetchDeletedFunc())
},
computed: {
  ...mapGetters([
    'userToken',
    'config',
    'dataset',
    'filesProxyId'
  ]),

  /**
   * Item has files
   */
  hasFiles: function () {
    return this.files.length > 0
  },

  dialogTitle: function() {
    return  'Files staged for permanent deletion'
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
  //deletes files permenantly. NOTE: should have toast message that confirms
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
  },
  //method moves selection(s) back to the datasets file storage (unmarked as deleted)
  moveBackToFiles: function(){
    //make promise (where you call undelete endpoint), on return call fetch deleted again to get updated list.
    const undeleteFilesMove = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("");
      }, 500);
    });
    undeleteFilesMove
        .then(fetchDeletedFunc())
        .catch((err) => {
          console.error(err);
        });
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

//will fetch all files that are marked deleted for a given dataset. Need proper API endpoints
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
<style src="../BfUpload/BfUpload.scss" scoped lang="scss"></style>
<style lang="scss">
  @import '../../assets/_variables.scss';
  .deleted-files .bf-dialog .bf-dialog-wrap {
    height: 700px;
    margin: -295px 0 0 -350px;
    width: 700px;
    overflow-y: scroll;
  }
  bf-upload-body {
    height: 200px;
    overflow-y: scroll;
  }
</style>
