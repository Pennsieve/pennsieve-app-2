<template>
  <bf-page class="bf-dataset-files">
    <locked-banner
      slot="banner"
    />
    <bf-rafter slot="heading">
      <div
        slot="heading"
        class="bf-dataset-breadcrumbs"
      >
        <breadcrumb-navigation
          :ancestors="ancestors"
          :file="file"
          :file-id="$route.params.fileId"
          @navigate-breadcrumb="handleNavigateBreadcrumb"
        />
      </div>
      <div
        slot="buttons"
        class="buttons"
      >
        <bf-upload-menu
          v-if="getPermission('editor')"
          :is-disabled="datasetLocked"
          @upload-menu-click="onUploadMenuClick"
        />
        <bf-button
          v-if="getPermission('editor')"
          class="secondary"
          :disabled="datasetLocked"
          data-cy="createNewFolder"
          @click="openPackageDialog"
        >
          New Folder
        </bf-button>
      </div>
    </bf-rafter>

    <bf-stage
      slot="stage"
      v-loading="isLoading"
      element-loading-background="transparent"
    >
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
      />
      <!--
      <div class="bf-table" v-if="hasFiles">
        <div class="bf-table-header">
          <el-row type="flex" align="middle" :gutter="20">
            <el-col :span="4">
              <button :class="[ isSorting('content.name') ? 'sort-active' : '']" @click="sortColumn('content.name')">Name<svg-icon class="sort-icon" :name="sortIcon('content.name')" color="currentColor" /></button>
            </el-col>

            <el-col :span="4">
                <button :class="[ isSorting('state') ? 'sort-active' : '']" @click="sortColumn('state')">Status<svg-icon class="sort-icon" :name="sortIcon('state')" color="currentColor" /></button>
            </el-col>

            <el-col :span="4">
              <button :class="[ isSorting('subtype') ? 'sort-active' : '']" @click="sortColumn('subtype')">Kind<svg-icon class="sort-icon" :name="sortIcon('subtype')" color="currentColor" /></button>
            </el-col>

            <el-col :span="4">
              <button :class="[ isSorting('storage') ? 'sort-active' : '']" @click="sortColumn('storage')">Size<svg-icon class="sort-icon" :name="sortIcon('storage')" color="currentColor"  /></button>
            </el-col>

            <el-col :span="4">
              <button :class="[ isSorting('content.createdAt') ? 'sort-active' : '']" @click="sortColumn('content.createdAt')">Date Created<svg-icon class="sort-icon" :name="sortIcon('content.createdAt')" color="currentColor" /></button>
            </el-col>

            <el-col :span="4"></el-col>
          </el-row>
        </div>

        <div>
          <div>
            <bf-file
              v-for="file in sortedFiles"
              :key="file.content.id"
              class="bf-table-row"
              @click="selectItem"
              @click-label="onClickLabel"
              @click-menu="onClickMenu"
              @delete="showDelete"
              @open-office-file="showOfficeModal"
              @move="showMove"
              @dragstart="_onDragStart"
              @dragend="_onDragEnd"
              @drag="_onDrag"
              @drop="_onDrop"
              :file="file"
              :is-selected="_getIsSelected(file)"
              :multiple-selected="multipleSelected"
              :interactive="true"
              data-cy="fileName" />
          </div>
        </div>
      </div>
      -->

      <bf-empty-page-state
        v-if="!hasFiles && !isLoading"
        class="bf-files-empty-state"
      >
        <img
          src="/static/images/illustrations/illo-add-files.svg"
          height="240"
          width="247"
          alt="Add files illustration"
        >

        <template v-if="getPermission('editor')">
          <h2>Drag and drop your files.</h2>
          <p>Add files to your dataset by dragging and dropping them here or by clicking<br>the 'Upload Files' button.</p>
        </template>
        <template v-else>
          <h2>This folder is empty.</h2>
        </template>
      </bf-empty-page-state>
    </bf-stage>

    <bf-package-dialog
      ref="packageDialog"
      :parent-folder="file"
      :files="files"
      @file-renamed="onFileRenamed"
      @folder-created="onFolderCreated"
    />

    <deleted-files
        :open.sync="deletedDialogOpen"
        @close-deleted-dialog = "closeDeletedDialog"

    />

    <bf-move-dialog
      ref="moveDialog"
      :file="file"
      :move-conflict.sync="moveConflict"
      :selected-files="selectedFiles"
      @rename-conflicts="onRenameConflicts"
      @move="moveItems"
    />

    <bf-delete-dialog
      ref="deleteDialog"
      :selected-files="selectedFiles"
      @file-delete="onDelete"
    />

    <bf-drop-info
      v-if="showDropInfo"
      :show-drop-info.sync="showDropInfo"
      :file="file"
    />

    <bf-upload-info v-if="showUploadInfo" />
  </bf-page>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  assocPath,
  head,
  pathOr,
  propOr,
  find,
  pathEq,
  findIndex,
  pluck
} from 'ramda'

import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import BfPackageDialog from './bf-package-dialog/BfPackageDialog.vue'
import BfDeleteDialog from './bf-delete-dialog/BfDeleteDialog.vue'
import BfMoveDialog from './bf-move-dialog/BfMoveDialog.vue'
import BreadcrumbNavigation from './BreadcrumbNavigation/BreadcrumbNavigation.vue'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'
import BfDropInfo from './bf-drop-info/BfDropInfo.vue'
import BfUploadInfo from './bf-upload-info/BfUploadInfo.vue'
import FilesTable from '../../FilesTable/FilesTable.vue'
import BfUploadMenu from './bf-upload-menu/BfUploadMenu.vue'
import DeletedFiles from '../../DeletedFiles/DeletedFiles.vue'
import Sorter from '../../../mixins/sorter/index'
import Request from '../../../mixins/request/index'
import EventBus from '../../../utils/event-bus'
import GetFileProperty from '../../../mixins/get-file-property'
import Cookie from 'js-cookie'
import LockedBanner from '../LockedBanner/LockedBanner';


export default {
  name: 'BfDatasetFiles',

  components: {
    BfRafter,
    BfButton,
    BfEmptyPageState,
    BfPackageDialog,
    BfDeleteDialog,
    BfMoveDialog,
    BfDropInfo,
    BfUploadInfo,
    BreadcrumbNavigation,
    BfUploadMenu,
    FilesTable,
    LockedBanner,
    DeletedFiles
  },

  mixins: [
    Sorter,
    Request,
    GetFileProperty
  ],

  data: function () {
    return {
      file: {
        content: {
          name: ''
        }
      },
      ancestors: null,
      files: [],
      sortedFiles: [],
      selectedFiles: [],
      moveConflict: {},
      showDropInfo: false,
      showUploadInfo: false,
      sortDirection: 'asc',
      singleFile: {},
      deletedDialogOpen: false
    }
  },

  computed: {
    ...mapGetters([
      'userToken',
      'config',
      'uploading',
      'dataset',
      'hasFeature',
      'filesProxyId',
      'getPermission',
      'datasetLocked'
    ]),

    /**
     * Item has files
     */
    hasFiles: function () {
      return this.files.length > 0
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

    /**
     * Get move URL
     * @returns {String}
     */
    moveUrl: function () {
      if (this.config.apiUrl && this.userToken) {
        return `${this.config.apiUrl}/data/move?api_key=${this.userToken}`
      }
    },

    /**
     * Compute if multiple files are selected
     * @returns {Boolean}
     */
    multipleSelected: function () {
      return this.selectedFiles.length > 1
    },

    /**
     * Compute if the user has explore feature flag
     * @returns {Boolean}
     */
    isExploreEnabled: function () {
      return this.hasFeature('concepts_feature')
    }

  },

  watch: {

    /**
     * Trigger API request when URL is changed
     */
    getFilesUrl: function () {
      this.fetchFiles()
    },

    uploading: {
      handler: function (uploading) {
        if (uploading) {
          this.showUploadInfo = true
        }
      },
      immediate: true
    },

    '$route.query.pkgId': {
      handler: function (val, old) {
        if (val !== old) {
          this.scrollToFile(val)
        }
      }
    },
  },

  mounted: function () {
    if (this.getFilesUrl && !this.files.length) {
      this.fetchFiles()
    }

    this.$el.addEventListener('dragenter', this.onDragEnter.bind(this))
    EventBus.$on('add-uploaded-file', this.onAddUploadedFile.bind(this))
    EventBus.$on('dismiss-upload-info', this.onDismissUploadInfo.bind(this))
    EventBus.$on('update-uploaded-file-state', this.onUpdateUploadedFileState.bind(this))
    EventBus.$on('update-external-file', this.onFileRenamed)
    EventBus.$on('openDeletedModal', (data) => {
      console.log("view deleted called from Rafter")
      this.deletedDialogOpen = data;
      this.fetchDeleted()
    })
    EventBus.$on('refreshAfterDeleteModal', (data) => {
      var temp = data;
      this.fetchFiles()
    })
  },

  destroyed: function () {
    this.$el.removeEventListener('dragenter', this.onDragEnter.bind(this))
    EventBus.$off('add-uploaded-file', this.onAddUploadedFile.bind(this))
    EventBus.$off('dismiss-upload-info', this.onDismissUploadInfo.bind(this))
    EventBus.$off('update-uploaded-file-state', this.onUpdateUploadedFileState.bind(this))
    EventBus.$off('update-external-file', this.onFileRenamed)
  },

  /**
   * Reset props before route change
   * @param {Object} to
   * @param {Object} from
   * @param {Function} next
   */
  beforeRouteUpdate(to, from, next) {
    this.resetSelectedFiles()

    next()
  },

  methods: {

    fetchDeleted: function() {
      console.log("fetch deleted called")
      EventBus.$emit('fetchDeleted',true)
    },

    closeDeletedDialog: function () {
      this.deletedDialogOpen = false;
    },

    /**
     * Set selected files
     * @param {Array} selection
     */
    setSelectedFiles: function (selection) {
      this.selectedFiles = selection
    },

    /**
     * Reset selected files state
     */
    resetSelectedFiles: function () {
      console.log("RESET SELECTED FILES CALLED")
      this.selectedFiles = []
      this.lastSelectedFile = {}
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

    /**
     * Send API request to get files for item
     */
    fetchFiles: function () {
      console.log('calling again')
      this.sendXhr(this.getFilesUrl)
        .then(response => {
          this.file = response
          console.log("FILE IS ",this.file)
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
     * Handler for clicking file
     * @param {Object} file
     */
    onClickLabel: function (file) {
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
     * Handler for clicking the file's menu button
     * @param {Object} file
     */
    onClickMenu: function (file) {
      // Check if the file is selected, and add it if it is not
      if (this.selectedFiles.indexOf(file) < 0) {
        this.selectedFiles = [file]
        this.lastSelectedFile = file
      }
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
     * Navigate to file
     * @param {String} id
     */
    navigateToFile: function (id) {
      this.$router.push({name: 'collection-files', params: {fileId: id}})
    },

    /**
     * Navigate to dataset route
     */
    navigateToDataset: function () {
      this.$router.push({name: 'dataset-files'})
    },

    /**
     * Handler for renaming file
     * @param {Object} updatedFile
     */
    onFileRenamed: function (updatedFile) {
      const id = pathOr('', ['content', 'id'], updatedFile)
      const file = find(pathEq(['content', 'id'], id), this.files)

      if (file) {
        file.content.name = updatedFile.content.name
      }
      this.sortColumn(this.sortBy, this.sortDirection)
    },

    /**
     * Handler for creating folder
     * @param {Object} folder
     */
    onFolderCreated: function (folder) {
      this.files.push(folder)
      this.sortColumn(this.sortBy, this.sortDirection)
    },

    /**
     * Open the package dialog
     */
    openPackageDialog: function () {
      this.$refs.packageDialog.visible = true
    },

    /**
     * Show delete dialog
     */
    showDelete: function () {
      this.$refs.deleteDialog.visible = true
    },

    /**
     * Handler for delete XHR
     */
    onDelete: function (response) {
      console.log("ONDELETE() CALLED. WE ARE REMOVING FILES FROM ITEMS")
      const successItems = propOr([], 'success', response)
      console.log("SUCCESS ITEMS ARE",successItems)
      this.removeItems(successItems)
    },

    /**
     * Remove items from files list
     * @param {Object} items
     */
    removeItems: function (items) {
      console.log("REMOVE ITEMS CALLED")
      // Remove all successfully deleted files
      for (let i = 0; i < items.length; i++) {
        const fileIndex = findIndex(pathEq(['content', 'id'], items[i]), this.files)
        console.log("FILE INDEX FOR REMOVE ITEMS IS ",fileIndex)
        this.files.splice(fileIndex, 1)
      }
      // Resort files
      this.sortColumn(this.sortBy, this.sortDirection)
      this.resetSelectedFiles()
    },

    /**
     * Show move dialog
     */
    showMove: function () {
      const moveDialog = this.$refs.moveDialog
      moveDialog.file = this.file
      moveDialog.visible = true
    },

    /**
     * Send XHR to move items
     * @param {String} destination}
     * @param {Array} items
     */
    moveItems: function (destination, items) {
      if (this.moveUrl) {
        const things = items.map(item => item.content.id)
        this.sendXhr(this.moveUrl, {
          method: 'POST',
          body: {
            destination,
            things
          }
        })
          .then(response => {
            this.onMoveItems(response)
          })
          .catch(response => {
            this.handleXhrError(response)
          })
      }
    },

    /**
     * Handler for move items endpoint request
     * @param {Object} response
     */
    onMoveItems: function (response) {
      // Remove successful items from the files list
      const successItems = propOr([], 'success', response)
      this.removeItems(successItems)

      // Handle conflict items
      const failures = propOr([], 'failures', response)
      const failureIds = pluck('id', failures)
      const failureItems = failureIds.map(id => {
        return find(pathEq(['content', 'id'], id), this.files)
      })

      // Show failure dialog
      if (failureItems.length > 0) {
        this.moveConflict = {
          display: failureItems,
          files: failures,
          destination: propOr(null, 'destination', response)
        }

        // Show user notice of conflicts
        this.$refs.moveDialog.visible = true
      }
    },

    /**
     * Rename conflicts, and then attempt to move them again
     * @param {String} destination
     * @param {Array} files
     */
    onRenameConflicts: function (destination, files) {
      // Rename each file with proposed new name
      const promises = files.map(obj => {
        const id = propOr('', 'id', obj)
        const url = `${this.config.apiUrl}/packages/${id}?api_key=${this.userToken}`

        return this.sendXhr(url, {
          method: 'PUT',
          body: {
            name: propOr('', 'generatedName', obj)
          }
        })
      });
      Promise.all(promises)
        .then(response => {
          // Move files again, now with new name
          this.moveItems(destination, response)

          // Reset
          this.moveConflict = {}

          // Hide user notice of conflicts
          this.$refs.moveDialog.visible = false

        })
    },

    /**
     * On drag enter, hide drop info
     * @param {Object} evt
     */
    onDragEnter: function (evt) {
      if (evt.dataTransfer.types && this.datasetLocked === false && this.getPermission('editor')) {
        for (let i = 0; i < evt.dataTransfer.types.length; i++) {
          if (evt.dataTransfer.types[i] === 'Files') {
            evt.dataTransfer.dropEffect = 'copy'
            evt.preventDefault()
            this.showDropInfo = true
            return true
          }
        }
      }
      this.showDropInfo = false
    },

    /**
     * Show upload
     */
    showUpload: function () {
      EventBus.$emit('open-uploader', true)

      // Update upload location
      this.$store.dispatch('updateUploadDestination', this.file)
    },

    /**
     * Update files list
     * @param {Object} evt
     */
    onAddUploadedFile: function (evt) {
      const {packageDTO, uploadDestination} = evt
      const uploadId = propOr('', 'id', uploadDestination)
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      const fileId = pathOr('', ['params', 'fileId'], this.$route)

      const exists = this.checkExists(packageDTO)
      const isParent = this.checkIsParent(packageDTO)

      if ((uploadId === datasetId || uploadId === fileId) && exists === false && isParent) {
        this.files.push(packageDTO)
        // Resort files
        this.sortColumn(this.sortBy, this.sortDirection)
        this.resetSelectedFiles()
      }
    },

    /**
     * Check if the package already exists in the dataset list
     * Used for adding collections
     * @param {Object} item
     * @returns {Boolean}
     */
    checkExists: function (item) {
      const id = pathOr('', ['content', 'id'], item)
      const idx = findIndex(pathEq(['content', 'id'], id), this.files)
      return idx >= 0
    },

    /**
     * Check if the package's parent is the current collection
     * @param {Object} item
     * @returns {Boolean}
     */
    checkIsParent: function (item) {
      const datasetId = pathOr('', ['content', 'id'], this.dataset)
      const parentId = pathOr(datasetId, ['parent', 'content', 'id'], item)
      const currentId = pathOr(0, ['content', 'id'], this.file)

      return parentId === currentId
    },

    /**
     * Update uploaded file state
     * @param {Object} evt
     */
    onUpdateUploadedFileState: function (evt) {
      const {packageDTO} = evt
      const pkgId = pathOr('', ['content', 'id'], packageDTO)

      const idx = this.files.findIndex(file => {
        const id = propOr('', 'id', file.content)
        if (id === pkgId) {
          return file
        }
      })

      if (idx >= 0) {
        this.$set(this.files, idx, packageDTO)

        // Resort files
        this.sortColumn(this.sortBy, this.sortDirection)
        this.resetSelectedFiles()
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
     * Handle dismiss upload info event
     */
    onDismissUploadInfo: function () {
      this.showUploadInfo = false
      this.$store.dispatch('updateTotalUploadSize', 0)
      this.$store.dispatch('updateUploadCount', 0)
    },

    /**
     * Handle upload menu click event
     * @param {String} command
     */
    onUploadMenuClick: function (command) {
      const options = {
        'file': this.showUpload,
        'external-file': this.openUploadExternalFileDialog
      }

      const handler = options[command]
      if (typeof handler === 'function') {
        handler()
      }
    },

    /**
     * Open upload external file modal
     */
    openUploadExternalFileDialog: function () {
      EventBus.$emit('open-external-file-modal')
    },

    /**
     * Process file and update the state of the file
     * @param {Object} file
     */
    processFile: function (file) {
      const packageId = pathOr('', ['content', 'id'], file)
      const url = `${this.config.apiUrl}/packages/${packageId}/process?api_key=${this.userToken}`

      this.sendXhr(url, {
        method: 'PUT',
        header: {
          Authorization: `bearer ${this.userToken}`
        }
      })
        .then(() => {
          // Update the file's state to show that it is processing
          const updatedFile = assocPath(['content', 'state'], 'PROCESSING', file)
          this.onUpdateUploadedFileState({packageDTO: updatedFile})
        })
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Get a presigned URL and copy the URL to the clipboard
     * @param {Object} file
     */
    getPresignedUrl: function (file) {
      const packageId = pathOr('', ['content', 'id'], file)

      // Get the files for the package
      const url = `${this.config.apiUrl}/packages/${packageId}?include=sources&includeAncestors=false&api_key=${this.userToken}`
      this.sendXhr(url, {
        method: 'GET',
        header: {
          Authorization: `bearer ${this.userToken}`
        }
      })
        .then(response => {
          const fileId = pathOr('', ['objects', 'source', 0, 'content', 'id'], response)
          const url = `${this.config.apiUrl}/packages/${packageId}/files/${fileId}?short=true&api_key=${this.userToken}`
          this.sendXhr(url, {
            method: 'GET',
            header: {
              Authorization: `bearer ${this.userToken}`
            }
          })
            .then(response => {
              this.$clipboard(pathOr('', ['url'], response))
              const msg = 'Temporary link to file copied to clipboard'
              EventBus.$emit('toast', {
                detail: {
                  type: 'success',
                  msg
                }
              })
            })
            .catch(response => {
              this.handleXhrError(response)
            })
        })
        .catch(response => {
          this.handleXhrError(response)
        })
    }
  }
}
</script>

<style scoped lang="scss">
.bf-dataset-files {
  background: #fff;
  position: relative;
  &.condensed {
    .bf-upload-info {
      display: none
    }
  }

  .bf-files-empty-state {
    h2 {
      font-size: 16px;
      font-weight: 600;
      line-height: 16px;
      text-align: center;
    }

    p {
      color: #71747C;
      font-size: 14px;
      line-height: 16px;
      text-align: center;
    }
  }
}
</style>
