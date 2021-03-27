<template>
  <div
    class="bf-file-label"
    :class="[
      interactive ? 'interactive' : 'non-interactive',
      shouldShowBtnOpenFile ? 'show-btn-open-file' : ''
    ]"
    @click="onClick('click', $event)"
  >
    <div
      v-if="shouldShowBtnOpenFile"
      class="btn-open-file mr-16"
    >
      <button
        v-if="shouldShowBtnOpenFilePackage"
        class="button-icon btn-icon-viewer"
        @click="openViewerOptions"
      >
        <svg-icon
          name="icon-eyeball"
          height="16"
          width="16"
        />
      </button>
      <a
        v-if="packageType === 'ExternalFile' && isExternalFileClickable"
        :href="fileLocation"
        target="_blank"
      >
        <button class="button-icon btn-icon-viewer">
          <svg-icon
            name="icon-link"
            height="16"
            width="16"
          />
        </button>
      </a>
    </div>

    <div
      v-if="getFileState === 'Processing' || getFileState === 'Uploading'"
      class="icon-waiting mr-16"
    >
      <bf-waiting-icon />
    </div>

    <img
      v-if="getFileState !== 'Processing' && getFileState !== 'Uploading'"
      class="svg-icon icon-item mr-16"
      :src="fileIcon(icon, file.content.packageType)"
    >

    <button
      class="name"
      data-cy="moveDialogFileName"
      :disabled="disabled"
      @click.stop="onClick('click-name', $event)"
    >
      {{ displayName }}
    </button>
  </div>
</template>

<script>
import {
  isNil,
  path,
  pathOr,
  propOr
} from 'ramda'
import { mapActions } from 'vuex'
import EventBus from '@/utils/event-bus'
import BfWaitingIcon from '@/components/shared/bf-waiting-icon//bf-waiting-icon.vue'


import FileIcon from '@/mixins/file-icon/index'
import GetFileProperty from '@/mixins/get-file-property'
import FileTypeMapper from '@/mixins/FileTypeMapper'
import { packageDisplayName } from '@/utils/packages'

import validUrl from 'valid-url'

export default {
  name: 'BfFileLabel',

  components: {
    BfWaitingIcon
  },

  mixins: [
    FileIcon,
    GetFileProperty,
    FileTypeMapper
  ],

  props: {
    file: {
      type: Object,
      default: () => {}
    },
    interactive: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    openFileButton: {
      type: Boolean,
      default: false
    },
    searchAllDataMenu: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    /**
     * Compute the display name which will decode
     * the response from the API
     * @returns {String}
     */
    displayName: function() {
      return packageDisplayName(this.file.content.name, this.file.extension, this.file.children)
    },

    /**
     * Compute if the file type has a viewer associate with it
     * @returns {Boolean}
     */
    hasViewer: function() {
      const packageType = pathOr('', ['content', 'packageType'], this.file)

      let hasViewer = isNil(this.typeMapper[packageType]) === false

      const packageProperties = propOr([], 'properties', this.file)
      const subtype = this.getFilePropertyVal(
        packageProperties,
        'subtype'
      ).toLowerCase()
      if (this.whitelist.indexOf(subtype) >= 0) {
        hasViewer = true
      }

      return hasViewer
    },

    /**
     * Gets the state of a file in the table
     * @returns {String}
     */
    getFileState: function() {
      const states = {
        'UPLOADED': 'Unprocessed',
        'PROCESSING': 'Processing',
        'RUNNING': 'Processing',
        'UNAVAILABLE': 'Uploading',
        'PENDING': 'Processing',
        'ERROR': 'Failed'
      }
      const fileState = path(['content', 'state'], this.file)
      return states[fileState] ? states[fileState] : ''
    },

    /**
     * Compute if external file is a url or local file path
     * @returns {Boolean}
     */
    isExternalFileClickable: function() {
      return Boolean(validUrl.isUri(this.fileLocation))
    },

    /**
     * Compute if package is an external file
     * @returns {Boolean}
     */
    isExternalFile: function() {
      return this.packageType === 'ExternalFile'
    },

    /**
     * Compute external file location
     * @returns {String}
     */
    fileLocation: function() {
      return pathOr('', ['externalFile', 'location'], this.file)
    },

    /**
     * Compute package type
     * @returns {String}
     */
    packageType: function() {
      return pathOr('', ['content', 'packageType'], this.file)
    },

    /**
     * Computes icon
     * @returns {String}
     */
    icon: function() {
      return (
        this.file.icon || this.getFilePropertyVal(this.file.properties, 'icon')
      )
    },

    /**
     * Compute if the open file button
     * should be visible
     * @returns {Boolean}
     */
    shouldShowBtnOpenFile: function() {
      if (this.openFileButton) {
        return this.isExternalFile
          ? this.isExternalFileClickable
          : this.shouldShowBtnOpenFilePackage
      }

      return false
    },

    /**
     * Compute if the open file button should
     * be visible for a package
     * @returns {Boolean}
     */
    shouldShowBtnOpenFilePackage: function() {
      return this.packageType != 'Collection'
        && this.hasViewer
        && this.getFileState === ''
    },

    /**
     * Checks if file type is an MS Office File
     * @returns {String}
     */
    isMSOfficeFile: function() {
      return this.file.subtype === 'MS Word' || this.file.subtype === 'MS Powerpoint' || this.file.subtype === "MS Excel"
    }
  },


  methods: {
    ...mapActions([
       'updateSearchModalVisible'
    ]),
    ...mapActions('filesModule', [
       'openOffice365File'
    ]),
    /**
     * Handles click event
     * @param {String} name
     * @param {Object} evt
     */
    onClick: function(name, evt) {
      this.$emit(name, evt)
    },

    /**
     * Opens different viewer depending on file type
     */
    openViewerOptions: function() {
      if (this.isMSOfficeFile) {
        return this.openOffice365File(this.file)
      } else {
        return this.openViewer()
      }
    },

    /**
     * Open viewer
     */
    openViewer: function() {
      if (this.searchAllDataMenu){
        this.updateSearchModalVisible(false)
      }
      const fileId = pathOr('', ['content', 'nodeId'], this.file)

      if (fileId) {
        this.$router.push({
          name: 'viewer',
          params: { fileId }
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_icon-item-colors.scss';

.bf-file-label {
  align-items: center;
  display: flex;
  flex-direction: row;
}
.svg-icon {
  flex-shrink: 0;
  height: 24px;
  width: 24px;
}
.name {
  font-size: inherit;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  .interactive & {
    &:hover,
    &:focus {
      cursor: pointer;
      color: $app-primary-color;
      text-decoration: underline;
    }
  }
}

.icon-waiting {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
}

.btn-open-file {
  line-height: 1;
  .btn-icon-viewer {
    align-items: center;
    background: $app-primary-color;
    color: #fff;
    height: 24px;
    justify-content: center;
    padding: 0;
    width: 24px;
    &:hover,
    &:focus {
      background: $dopamine-dark;
    }
    &:hover {
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
    }
  }
}
</style>

