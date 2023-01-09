<template>
  <div
    class="deleted-files"
  >
    <bf-dialog
      :title="TEST"
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
                :data="uploadFileList()"
                :multiple-selected="false"
                :within-upload-menu="true"
                :enable-download="false"
                :enable-file-move="false"
                @delete="uploadRemoveFile"
                @process="uploadProcessFile"
                @copy-url="uploadGetPresignedUrl"
                @selection-change="uploadSetSelectedFiles"
                @click-file-label="uploadOnClickLabel">
              </files-table>
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
  FilesTable
},
mounted: {
 EventBus.$on('fetchDeleted', (data) => {
   this.fetchDeleted()
 })
},
methods: {
//will fetch all files that are marked deleted for a given dataset
 fetchDeleted: function() {

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
