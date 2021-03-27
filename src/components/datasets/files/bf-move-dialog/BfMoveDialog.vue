<template>
  <el-dialog
    :visible.sync="visible"
    data-cy="bfMoveDialog"
    class="bf-move-dialog"
    :show-close="false"
    @close="closeDialog"
    @open="onOpenDialog"
  >
    <bf-dialog-header
      slot="title"
      data-cy="bfMoveDialogTitle"
      :title="dialogTitle"
    />

    <dialog-body>
      <template v-if="hasConflicts">
        <p>You have tried to move an item(s) with the same name into the same destination. If you would like to proceed, the following item(s) will be renamed:</p>
        <div class="content-wrap">
          <bf-file-label
            v-for="file in moveConflict.display"
            :key="file.content.id"
            :file="file"
            :interactive="false"
          />
        </div>
      </template>

      <template v-else>
        <div class="breadcrumb-dropdown">
          <div
            id="current-folder"
            data-cy="moveFolderLink"
          >
            <button
              v-if="!isAtDataset"
              id="btn-go-up"
              @click="goUp"
            >
              <svg-icon
                name="icon-arrow-left"
                height="8"
                width="8"
              />
            </button>

            <div id="current-folder-name">
              {{ fileName }}
            </div>
          </div>
        </div>

        <div
          v-loading="isLoading"
          element-loading-background="transparent"
        >
          <div
            ref="filesList"
            class="file-wrap files-list"
            data-cy="filesList"
          >
            <bf-file-label
              v-for="folder in folders"
              :key="folder.content.id"
              :class="[
                isSelected(folder) ? 'selected' : ''
              ]"
              :file="folder"
              @click="onFileClick(folder)"
              @click-name="onFileNameClick(folder)"
            />
            <div
              v-if="folders.length === 0 && !isLoading"
              id="empty-state"
            >
              <p>There are no more subfolders</p>
            </div>
          </div>
        </div>
      </template>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        data-cy="closeMoveDialog"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        v-if="hasConflicts"
        data-cy="fileRenameConflicts"
        @click="renameConflicts"
      >
        Proceed
      </bf-button>
      <bf-button
        v-if="!hasConflicts"
        data-cy="moveFile"
        @click="move"
      >
        Move here
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
  import BfButton from '../../../shared/bf-button/BfButton.vue'
  import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
  import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
  import BfFileLabel from '../bf-file/BfFileLabel.vue'
  import Request from '../../../../mixins/request/index'
  import Sorter from '../../../../mixins/sorter/index'
  import EventBus from '../../../../utils/event-bus'

  import { propOr, path, pathOr, pathEq, reverse, equals, filter, find, isNil, propEq, defaultTo } from 'ramda'
  import { mapGetters } from 'vuex'

  export default {
    name: 'BfMoveDialog',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton,
      BfFileLabel
    },

    mixins: [
      Sorter,
      Request
    ],

    props: {
      moveConflict: {
        type: Object,
        default: function() {
          return {}
        }
      },
      selectedFiles: {
        type: Array
      }
    },

    data: function() {
      return {
        visible: false,
        sortedFiles: [],
        file: {},
        isLoading: false,
        destination: {}
      }
    },

    computed: {
      ...mapGetters([
        'userToken',
        'config',
        'dataset'
      ]),

      /**
       * Computes if the move payload has conflicts
       * @returns {Boolean}
       */
      hasConflicts: function() {
        return Object.keys(this.moveConflict).length > 0
      },

      /**
       * Computes form URL based on type of action user is taking (rename vs creating)
       * @returns {String}
       */
      moveUrl: function() {
        if (this.config.apiUrl && this.userToken) {
          return `${this.config.apiUrl}/data/delete?api_key=${this.userToken}`
        }
      },

      /**
       * Get filename if there is a file
       * @returns {String}
       */
      fileName: function() {
        return pathOr('', ['content', 'name'], this.file)
      },

      /**
       * Get dataset if there is a file
       * @returns {String}
       */
      datasetName: function() {
        return pathOr('', ['content', 'name'], this.dataset)
      },

      /**
       * Compute dialog title based on if the user is moving or seeing conflicts
       * @returns {String}
       */
      dialogTitle: function() {
        let itemLabel = 'Conflicts'

        if (this.selectedFiles.length) {
          const destination = defaultTo({}, pathOr(path(['content'], this.file), ['content'], this.destination))
          const destinationName = propOr('', 'name', destination)

          itemLabel = `Move to ${destinationName}`

          if (propEq('packageType', 'DataSet')(destination)) {
            itemLabel += ' - All Files'
          }
        }

        return  itemLabel
      },

      /**
       * Compute if viewing at the dataset level
       */
      isAtDataset: function() {
        const fileId = pathOr('', ['content', 'id'], this.file)
        const datasetId = pathOr('', ['content', 'id'], this.dataset)
        return equals(fileId, datasetId)
      },

      /**
       * Filter folders out of files
       * @returns {Array}
       */
      folders: function() {
        return filter(pathEq(['content', 'packageType'], 'Collection'), this.sortedFiles)
      }
    },

    methods: {
      /**
       * Compute if file is set as the destination
       * @returns {Boolean}
       */
      isSelected: function(file) {
        const selectedId = pathOr('', ['content', 'id'], this.destination)
        return pathEq(['content', 'id'], selectedId, file)
      },

      /**
       * On dialog open
       */
      onOpenDialog: function() {
        const children = propOr([], 'children', this.file)
        if(!children.length) {
          return
        }
        const baseUrl = pathEq(['content', 'packageType'], 'Collection', this.file) ? 'packages' : 'datasets'
        const id = pathOr('', ['content', 'id'], this.file)
        const url = `${this.config.apiUrl}/${baseUrl}/${id}?api_key=${this.userToken}&includeAncestors=true`
        this.fetchFiles(url)
      },

      /**
       * Closes the dialog
       */
      closeDialog: function() {
        this.file = {}
        this.visible = false
        this.destination = {}
        this.$emit('update:moveConflict', {})
      },

      /**
       * Scroll the files list to the top
       */
      scrollTopFiles: function() {
        this.$nextTick(() => {
          const filesList = this.$refs.filesList
          filesList.scrollTop = 0
        })
      },

      /**
       * Emit rename conflicts event
       */
      renameConflicts: function() {
        const destination = propOr([], 'destination', this.moveConflict)
        const files = propOr([], 'files', this.moveConflict)
        this.$emit('rename-conflicts', destination, files)
      },

      /**
       * Handle file click, set move destination
       * @param {Object} file
       */
      onFileClick: function(file) {
        if ( this.destination === file) {
          this.destination = {}
        } else {
          this.destination = file
        }
      },

      /**
       * Handle file name click, get file data
       * @param {Object} file
       */
      onFileNameClick: function(file) {
        const id = pathOr('', ['content', 'id'], file)
        const url = `${this.config.apiUrl}/packages/${id}?api_key=${this.userToken}&includeAncestors=true`
        this.fetchFiles(url)
      },

      goUp: function() {
        const destination = (isNil(this.file.parent)) ?
          this.dataset :
          this.file.parent

        const baseUrl = pathEq(['content', 'packageType'], 'Collection', destination) ? 'packages' : 'datasets'
        const id = pathOr('', ['content', 'id'], destination)
        const url = `${this.config.apiUrl}/${baseUrl}/${id}?api_key=${this.userToken}&includeAncestors=true`

        const currentFileId = pathOr('', ['content', 'id'], this.file)
        if (id !== currentFileId) {
          this.fetchFiles(url)
        }
      },

      /**
       * Get file information
       * @param {String} url
       */
      fetchFiles: function(url) {
        // Reset selected
        this.destination = {}

        this.sendXhr(url)
        .then(response => {
          this.file = response
          this.sortedFiles = this.returnSort('content.name', this.file.children, 'asc')
          this.scrollTopFiles()
        })
        .catch(response => {
          this.handleXhrError(response)
        })
      },

      /**
       * Set move to destination and close dialog
       */
      move: function() {
        const fileId = pathOr('', ['content', 'id'], this.file)
        let destinationId = pathOr(fileId, ['content', 'id'], this.destination)

        if (destinationId.indexOf('dataset') >= 0) {
          destinationId = null
        }

        // Ensure the user isn't moving a folder into itself
        if (find(pathEq(['content', 'id'], destinationId), this.selectedFiles)) {
          EventBus.$emit('toast', { detail: { type: 'ERROR_DETAIL', msg: 'Cannot move an item into itself' }})
          return
        }

        this.$emit('move', destinationId, this.selectedFiles)
        this.closeDialog()
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../../assets/_variables.scss';
  @import '../../../../assets/_icon-item-colors.scss';

  .bf-move-dialog {
    .files-list {
      box-sizing: border-box;
      height: 264px;
      overflow: scroll;
      .bf-file-label {
        cursor: pointer;
        padding: 8px 16px;
        &:last-child {
          border: none;
        }
        &.selected {
          background: #F5F6F9;
        }
        .svg-icon {
          margin-right: 8px;
        }
      }
    }
    #current-folder {
      align-items: center;
      color: #000;
      display: flex;
      font-weight: 600;
      margin-bottom: 8px;
    }
    #current-folder-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #btn-go-up {
      align-items: center;
      display: inline-flex;
      padding: 0 8px;
      &:hover, &:focus {
        color: $app-primary-color;
      }
    }
    #empty-state {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: center;
    }
  }

</style>
