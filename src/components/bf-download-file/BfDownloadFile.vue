<template>
  <div>
    <form
      id="zipForm"
      method="POST"
      :action="`${config.zipitUrl}/?api_key=${userToken}`"
    >
      <input
        v-model="zipData"
        type="hidden"
        name="data"
      >
    </form>
    <form
      id="recordCsvForm"
      method="POST"
      :action="`${recordCsvUrl}`"
    >
      <input
        v-model="recordCsvQuery"
        type="hidden"
        name="data"
      >
    </form>
    <el-dialog
      :visible.sync="visible"
      data-cy="bfDownloadDialog"
      class="bf-download-dialog"
      :show-close="false"
      @close="closeDialog"
    >
      <bf-dialog-header
        slot="title"
        data-cy="bfMoveDialogTitle"
        title="Confirm Download"
      />

      <dialog-body class="bf-download-body">
        <div
          v-if="showReduceSize"
          class="mb-24"
        >
          <p>The file(s) you are trying to download exceed the limit of {{ formatMetric(config.maxDownloadSize) }}. Please reduce the number of files selected and try again.</p>
          <el-table
            :show-header="false"
            :border="false"
            :data="fileDTOs || packageDTOs"
          >
            <el-table-column
              prop="content.name"
            >
              <template slot-scope="scope">
                <bf-file-label
                  :file="scope.row"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="storage"
              align="right"
            >
              <template slot-scope="scope">
                {{ formatMetric(scope.row.storage) }}
                <button
                  @click="removeRow(scope.row)"
                >
                  <svg-icon
                    color="#bdbdbd #404554"
                    icon="icon-x-circle"
                    height="28"
                    width="28"
                  />
                </button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div
          v-if="packageDTOs.length > 1"
          class="download-name"
        >
          <label for="downloadName">
            File Name
          </label>
          <el-input
            id="downloadName"
            v-model="archiveName"
          />
          <span>.zip</span>
        </div>
      </dialog-body>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <bf-button
          class="secondary"
          data-cy="closeDownloadDialog"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          data-cy="download"
          :disabled="disableDownload"
          @click="confirmDownload(packageDTOs, fileDTOs)"
        >
          Download
        </bf-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { pathOr } from 'ramda';
  import Request from '../../mixins/request/index';
  import BfDialogHeader from '../shared/bf-dialog-header/BfDialogHeader';
  import DialogBody from '../shared/dialog-body/DialogBody';
  import BfButton from '../shared/bf-button/BfButton';
  import BfFileLabel from '../datasets/files/bf-file/BfFileLabel';
  import BfStorageMetrics from '@/mixins/bf-storage-metrics';
  import Sorter from '../../mixins/sorter';

  const DEFAULT_ARCHIVE_NAME = 'pennsieve-data'

  export default {
    name: 'BfDownloadFile',

    components: {
      BfDialogHeader,
      DialogBody,
      BfButton,
      BfFileLabel,
    },

    mixins: [
      Sorter,
      Request,
      BfStorageMetrics,
    ],

    data() {
      return {
        zipData: '',
        visible: false,
        packageDTOs: [],
        fileDTOs: undefined,
        recordCsvQuery: '',
        archiveName: DEFAULT_ARCHIVE_NAME,
        showReduceSize: false,
        downloadConfirmed: false,
      }
    },

    computed: {
      ...mapGetters([
        'userToken',
        'config'
      ]),

      ...mapState(['config', 'userToken', 'activeOrganization']),
      /**
       * Compute the url for downloading a csv of records
       * @returns {String}
       */
      recordCsvUrl: function() {
        const activeOrgIntId = pathOr('', ['organization', 'intId'], this.activeOrganization)
        return `${this.config.apiUrl}/models/v2/organizations/${
          activeOrgIntId
        }/search/records/csv?api_key=${this.userToken}`
      },

      sizeTarget: function() {
        return this.fileDTOs || this.packageDTOs;
      },

      /**
       * sums the "storage" property on each row to get a total download size
       */
      downloadSize: function() {
        return this.sizeTarget.reduce(
          (total, row) => {
            total = total + row.storage
            return total;
          },
          0
        )
      },

      /**
       * download is disabled if the total size is greater than the threshold, or no rows are selected
       */
      disableDownload: function() {
        return this.downloadSize > this.config.maxDownloadSize || this.sizeTarget.length === 0
      },

      /**
       * determines whether the confirm download dialog should open
       */
      shouldConfirmDownload: function() {
        return this.disableDownload ||
          (this.packageDTOs.length > 1 && !this.downloadConfirmed)
      },
    },

    methods: {

      /**
       * Closes the dialog and initializes state
       */
      closeDialog: function() {
        this.archiveName = DEFAULT_ARCHIVE_NAME;
        this.downloadConfirmed = false;
        this.showReduceSize = false;
        this.visible = false;
      },

      /**
       * removes a row from the dialog
       */
      removeRow: function(row) {
        if (this.fileDTOs) {
          this.fileDTOs = this.fileDTOs.filter(f => f.id !== row.id)
        } else {
          this.packageDTOs = this.packageDTOs.filter(p => p.content.id !== row.content.id)
        }
      },

      confirmDownload(packageDTOs, fileDTOs) {
        this.downloadConfirmed = true;
        this.triggerDownload(packageDTOs, fileDTOs)
      },

      /**
       * either directly begins downloading, or renders the popup when the size is too large
       * @param packageDTOs an array of package DTO's (or file DTO's with content.name, such that things render properly)
       * @param fileDTOs optional - indicates that we are downloading files, NOT packages
       *     represents the parent package of those files
       */
      triggerDownload: function(packageDTOs, fileDTOs) {
        this.packageDTOs = packageDTOs;
        this.fileDTOs = fileDTOs;
        this.$nextTick(() => {
          if (this.shouldConfirmDownload) {
            this.showReduceSize = this.disableDownload
            this.visible = true;
          } else {
            const nodeIds = this.packageDTOs.map(s => s.content.nodeId)
            if (this.fileDTOs) {
              const fileIds = this.fileDTOs.map(f => f.id)
              this.downloadPackages(nodeIds, fileIds)
            } else {
              this.downloadPackages(nodeIds)
            }
            this.closeDialog()
          }
        })
      },

      triggerRecordCsvDownload: function(query) {
        this.recordCsvQuery = JSON.stringify(query);
        this.$nextTick(() => {
          // eslint-disable-next-line no-undef
          recordCsvForm.submit()
        })
      },


      /**
       * downloads multiple packages
       * @param {Array} nodeIds
       * @param {Array} fileIds - when downloading a single package, includes only specified files
       */
      downloadPackages: function(nodeIds, fileIds) {
        const fileIdPayload = fileIds ? { fileIds } : {}
        const archiveNamePayload = this.archiveName && nodeIds.length > 1 ? { archiveName: this.archiveName } : {}
        const payload = { nodeIds, ...fileIdPayload, ...archiveNamePayload }
        this.zipData = JSON.stringify(payload, undefined)
        this.$nextTick(() => {
          // eslint-disable-next-line no-undef
          zipForm.submit()
        })
      }
    }
  }
</script>

<style lang="scss">
  .bf-download-body {
    /deep/ .el-table {
      max-height: 400px;
      overflow: hidden;
      overflow-y: scroll;
    }
    .download-name {
      display: flex;
      align-items: center;
      label {
        min-width: 64px;
      }
      /deep/ .el-input {
        margin: 0 8px;
      }
    }
  }
</style>
